/**
 * controller.js
 * 
 * Created by Deddy Christoper Kakunsi
 * Manado, Indonesia.
 * deddy.kakunsi@gmail.com
 * 
 * Version: 1.0.0
 */

$( document ).ready( function () {

	if ( session.isAuthenticated() == false ) {
		window.location.href = 'login.html';
		return;
	}
	
	var role = session.getRole();
	if ( ( role != 'ADMIN' && role != 'OPERATOR' ) ) {
		message.write( 'Hanya operator yang dapat mengakses halaman ini' );
		console.log( "Bukan operator mencoba login" );

		// redirect ke halaman login
		window.location.href = 'login.html';
		return;
	}

	// bersihkan storage
	storage.reset();

	page.change( $( '#operator-nama' ), session.getName() );
	page.setName( 'HOME' );
	
	setHomePage( role, session.getSatuanKerja() );
	setNavigation( role, session.getSatuanKerja() );

	$( function () {
		$( '[ data-toggle = "tooltip" ]' ).tooltip();
	} );

	// handler untuk logout
	$( document ).on( 'click', '#nav-logout', function() {
		
		page.change( $( '#message' ), '' );
		
		var accountRest = rest( 'http://222.124.150.12:8080', 'account' );
		accountRest.logout();

	} );

	// handler untuk ubah password
	$( document ).on( 'click', '#btn-ubah-password', function() {

		var password = $( '#form-password' ).val();
		alert( "Belum bisa mengubah password" );
		
	} );

	// handler untuk buka halaman tagihan
	$( document ).on( 'click', '#menu-poliklinik-tagihan', function() {
		page.load( $( '#content' ), 'html/home/poliklinik.html' );
	} );

	// handler untuk cari data pasien
	$( document ).on( 'click', '#btn-get-pasien', function() {
		var kodePasien = $( '#txt-kode-pasien' ).val();
		
		var succ = function( res ) {
			
			if ( res && res.tipe == 'ERROR' ) {
				alert( "Tidak ada pasien dengan kode: " + kodePasien );
				return;
			}

			var pasien = res.object;
			storage.set( pasien, 'pasien' );
			
			page.change( $( '#pasien-medrek' ), "Medrek: " + pasien.penduduk.kode );
			page.change( $( '#pasien-nama' ), pasien.nama );
			page.change( $( '#pasien-umur' ), pasien.umur + " Tahun" );
			page.change( $( '#pasien-kelamin' ), pasien.kelamin );
			page.change( $( '#pasien-agama'), pasien.agama );
			page.change( $( '#pasien-kelas'), "Kelas " + pasien.kelas );
			page.change( $( '#pasien-tanggungan'), "Pasien " + pasien.penanggung );
			
			var pelayananRest = rest( "http://222.124.150.12:8080", "service");
			pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );
			
		};
		
		var pasienRest = rest( "http://222.124.150.12:8080", "patient" );
		pasienRest.call( "/pasien/kode/" + kodePasien, null, "GET", succ, message.writeError, false );

	} );

	// handler untuk cari tindakan
	$( document ).on( 'click', '#btn-get-tindakan', function() {
		var kodeTindakan = $( '#txt-kode-tindakan' ).val();

		var succ = function( res ) {
			
			if ( res && res.tipe == 'ERROR' ) {
				alert( "Tidak ada tindakan dengan kata kunci: " + kodeTindakan );
				return;
			}
			
			var listTindakan = res.list;
			storage.set( listTindakan, 'listTindakan' );
			
			var html = "";
			for ( i = 0; i < listTindakan.length; i++ ) {
				var tindakan = listTindakan[ i ];
				
				html += '<tr>' +
					'<td>' + tindakan.nama + '</td>' +
					'<td>' + tindakan.kelas + '</td>' +
					'<td>' +
					'<button type="button" class="btn btn-warning btn-xs pull-right" onclick="tagihanView.pilihTindakan(' + tindakan.id + ')">' +
					'<span class="glyphicon glyphicon-check" aria-hidden="true"></span>' +
					' Pilih' +
					'</button>' +
					'</td>' +
					'</tr>';
			}

			page.change( $( '#table-tindakan' ), html );
		};
		
		var tindakanRest = rest( 'http://222.124.150.12:8080', 'treatment' );
		tindakanRest.call( "/tindakan/keyword/" + kodeTindakan, null, "GET", succ, message.writeError, false );
	} );
	
	// handler untuk simpan tagihan
	$( document ).on( 'click', '#btn-tagihan-simpan', function() {
		var jumlah = $( '#txt-tagihan-jumlah' ).val();
		var tambahan = $( '#txt-tagihan-biaya-tambahan' ).val();
		var tindakan = storage.get( 'tindakan' );

		var pasien = storage.get( 'pasien' );
		pasien.listTagihan = null;
		
		var tagihan = {
			tindakan: tindakan,
			biayaTambahan: tambahan,
			jumlah: jumlah,
			tanggal: myDate.getNowAsDatePicker(),
			pasien: pasien,
			unit: session.getSatuanKerja(),
			status: "MENUNGGAK",
			tipePelayanan: "PELAYANAN",
			tipeTagihan: "PELAYANAN",
			keterangan: null,
			pelaksana: null
		}

		var pelayananRest = rest( "http://222.124.150.12:8080", "service");
		var succ = function( res ) {
			message.success( res, "Berhasil menambah tagihan pasien" );
			pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );
		};
		
		pelayananRest.call( "/pelayanan", tagihan, "POST", succ, message.writeError, false );
	} );
	
	// handler untuk menu ruangan
	$( document ).on( 'click', '#menu-ruangan', function() {
		alert( "halaman data ruangan" );
	} );	
	
	// handler untuk menu tagihan ruangan
	// tagihan ruangan sama dengan tagihan poliklinik
	$( document ).on( 'click', '#menu-ruangan', function() {
		page.load( $( '#content' ), 'html/home/poliklinik.html' );
	} );
	
	// Table Handler
	$( document ).on( 'click', '#prev', function() {
	
		var pageNumber = $( '#pageNumber' ).text();
		var previousPage = parseInt( pageNumber  ) - 1;
		
		if ( previousPage < 1 )
			previousPage = 1;
		
		activeContainer.content.setData( activeContainer.list, previousPage );
	
		page.change( $( '#pageNumber' ), previousPage );
		
	} );
	
	$( document ).on( 'click', '#next', function() {
	
		var pageNumber = $( '#pageNumber' ).text();
		var nextPage = parseInt( pageNumber ) + 1;

		var lastPage = activeContainer.list.length / set;
		if ( nextPage > lastPage ) {
			nextPage = Math.floor( lastPage );
			
			if ( ( nextPage * set ) < activeContainer.list.length )
				nextPage = nextPage + 1;
			
		}

		activeContainer.content.setData( activeContainer.list, nextPage );
	
		page.change( $( '#pageNumber' ), nextPage );
		
	} );

	// Cari Handler.
	$( document ).on( 'focus', '#search', function() {
	
		$( '#search' ).attr( 'placeholder', 'Masukan Kata Kunci' );
		page.change( $( '#table' ), '' );
		page.change( $( '#message' ), '');
		
	} );
	
	$( document ).on( 'blur', '#search', function() {
	
		$( '#search' ).attr( 'placeholder', 'Cari...' );
		$( '#search' ).val( '' );
		
	} );
	
	$( document ).on( 'change', '#search', function() {
	
		var kataKunci = $( '#search' ).val();
		var halaman = page.getName();

		alert( "Fitur pencarian belum bisa digunakan" );
	} );

} );

function setNavigation( role, unit ) {

	if ( role == "ADMIN" ) {
		page.load( $( '#nav-menu' ), 'html/navigation/admin.html' );
	} else if ( role == "OPERATOR" ) {
		
		var tipe = unit.tipe;
		if ( tipe == "POLIKLINIK" || tipe == "PENUNJANG_MEDIK" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/poliklinik.html' );
		} else if ( tipe == "LOKET_PENDAFTARAN" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/pendaftaran.html' );
		} else if ( tipe == "LOKET_PEMBAYARAN" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/pembayaran.html' );
		} else if ( tipe == "RUANG_PERAWATAN" || tipe == "ICU" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/ruangan.html' );
		} else if ( tipe == "APOTEK_FARMASI" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/apotek.html' );
		} else if ( tipe == "UGD" ) {
			page.load( $( '#nav-menu' ), 'html/navigation/ugd.html' );
		}

	} else {
		throw new Error( "Role: '" + role + "' is unknown" );
	}
};

function setHomePage( role, unit ) {

	if ( role == "ADMIN" ) {
		page.load( $( '#content' ), 'html/home/admin.html' );
	} else if ( role == "OPERATOR" ) {
		
		var tipe = unit.tipe;
		if ( tipe == "POLIKLINIK" || tipe == "PENUNJANG_MEDIK" ) {
			page.load( $( '#content' ), 'html/home/poliklinik.html' );
		} else if ( tipe == "LOKET_PENDAFTARAN" ) {
			page.load( $( '#content' ), 'html/home/pendaftaran.html' );
		} else if ( tipe == "LOKET_PEMBAYARAN" ) {
			page.load( $( '#content' ), 'html/home/pembayaran.html' );
		} else if ( tipe == "RUANG_PERAWATAN" || tipe == "ICU" ) {
			page.load( $( '#content' ), 'html/home/ruangan.html' );
		} else if ( tipe == "APOTEK_FARMASI" ) {
			page.load( $( '#content' ), 'html/home/apotek.html' );
		} else if ( tipe == "UGD" ) {
			page.load( $( '#content' ), 'html/home/ugd.html' );
		}

	} else {
		throw new Error( "Role: '" + role + "' is unknown" );
	}
};

var tagihanView = {
	
	setTable: function( data ) {
		var html = '';

		for ( i = 0; i < data.length; i++ ) {
			var tagihan = data[ i ];
			var tanggal = myDate.fromDatePicker( tagihan.tanggal );

			html += '<tr>' +
				'<td>' + tanggal.getString() + '</td>' +
				'<td>' + tagihan.namaUnit + '</td>' +
				'<td>' + tagihan.nama + '</td>' +
				'<td>' + tagihan.jumlah + '</td>' +
				'<td>' + number.addCommas( tagihan.tagihanCounted ) + '</td>' +
				'<td>' +
				'<button type="button" class="btn btn-danger btn-xs pull-right" onclick="tagihanView.dropTagihan(' + tagihan.id + ')">' +
				'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
				' Hapus' +
				'</button>' +
				'</td>' +
				'</tr>';
		}

		page.change( $( '#table-tagihan' ), html );
	},
	
	dropTagihan: function( id ) {
		var pelayananRest = rest( "http://222.124.150.12:8080", "service");
		var succ = function( res ) {
			
			if ( res.tipe == "ERROR" ) {
				alert( res.message );
				return;
			}
			
			var pasien = storage.get( 'pasien' );
			//pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );

			// hapus tagihan dari list
			var listTagihan = pasien.listTagihan;
			listTagihan = myList.removeById( listTagihan, id );
			tagihanView.resetTagihan( listTagihan );
		};
		
		pelayananRest.call( "/pelayanan/" + id, null, "DELETE", succ, message.writeError, false );
		
	},
	
	pilihTindakan: function( id ) {
		var listTindakan = storage.get( 'listTindakan' );
		for ( i = 0; i < listTindakan.length; i++ ) {
			var tindakan = listTindakan[ i ];
			
			if ( id == tindakan.id ) {
				page.change( $( '#tindakan-nama' ), "Tindakan " + tindakan.nama );
				page.change( $( '#tindakan-kelas' ), "Kelas " + tindakan.kelas );
				page.change( $( '#tindakan-tanggungan' ), "Tanggungan " + tindakan.penanggung );
				
				storage.set( tindakan, 'tindakan' );
			}
		}
	},
	
	loadTagihan: function( res ) {
		
		if ( res && res.tipe == 'ERROR' ) {
			alert( "Belum ada tagihan untuk pasien" );
			return;
		}

		tagihanView.resetTagihan( res.list );
	},
	
	resetTagihan: function( data ) {
		var pasien = storage.get( 'pasien' );
		pasien.listTagihan = data;
		storage.set( pasien, 'pasien' );
		
		tagihanView.setTable( data );
	}
	
};

