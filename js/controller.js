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
	loadData( session.getSatuanKerja() );

	$( function () {
		$( '[ data-toggle = "tooltip" ]' ).tooltip();
	} );

	// handler untuk logout
	$( document ).on( 'click', '#nav-logout', function() {
		
		page.change( $( '#message' ), '' );
		
		var accountRest = rest( server, 'account' );
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
			page.change( $( '#pasien-nama' ), "Nama: " + pasien.nama );
			page.change( $( '#pasien-umur' ), "Umur: " + pasien.umur + " Tahun" );
			page.change( $( '#pasien-kelamin' ), "Jenis Kelamin: " + pasien.kelamin );
			page.change( $( '#pasien-agama'), "Agama: " + pasien.agama );
			page.change( $( '#pasien-kelas'), "Kelas " + pasien.kelas );
			page.change( $( '#pasien-tanggungan'), "Pasien " + pasien.penanggung );
			
			var pelayananRest = rest( server, "service");
			pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );
			
		};
		
		var pasienRest = rest( server, "patient" );
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
		
		var tindakanRest = rest( server, 'treatment' );
		tindakanRest.call( "/tindakan/keyword/" + kodeTindakan, null, "GET", succ, message.writeError, false );
	} );
	
	// handler untuk simpan tagihan
	$( document ).on( 'click', '#btn-tagihan-simpan', function() {
		var pasien = storage.get( 'pasien' );
		if ( !pasien ) {
			alert( "GAGAL: Anda belum memilih pasien" );
			return;
		}
		
		var tindakan = storage.get( 'tindakan' );
		if ( !tindakan ) {
			alert( "GAGAL: Anda belum memilih tindakan" );
		}

		var tagihan = {
			pasien: pasien,
			tindakan: tindakan,
			unit: session.getSatuanKerja(),
			biayaTambahan: $( '#txt-tagihan-biaya-tambahan' ).val(),
			jumlah: $( '#txt-tagihan-jumlah' ).val(),
			tanggal: $( '#txt-tagihan-tanggal' ).val(),
			status: "MENUNGGAK",
			tipePelayanan: "PELAYANAN",
			tipeTagihan: "PELAYANAN",
			keterangan: null,
			pelaksana: null
		}

		var pelayananRest = rest( server, "service");
		var succ = function( res ) {
			message.success( res, "Berhasil menambah tagihan pasien" );
			pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );
		};
		
		pelayananRest.call( "/pelayanan", tagihan, "POST", succ, message.writeError, false );
	} );
	
	// handler untuk menu tagihan ruangan
	// tagihan ruangan sama dengan tagihan poliklinik
	$( document ).on( 'click', '#menu-ruangan', function() {
		page.load( $( '#content' ), 'html/home/ruangan.html' );
		ruanganView.resetRuangan();
	} );

	// handler untuk menyimpan data pasien masuk ruangan
	$( document ).on( 'click', '#btn-simpan-pasien-masuk', function() {
		var kodePasien = $( '#txt-kode-pasien' ).val();
		var unit = session.getSatuanKerja();
		var pasienRest = rest( server, 'patient' );
		var suc = function( res ) {
			message.success( res );
			
			if ( res.tipe != "ERROR" ) {
				pasienRest.call( "/pasien/unit/" + unit.id, null, "GET", ruanganView.loadRuangan, message.writeError, false );
			}
		};
		
		pasienRest.call( "/pasien/" + kodePasien + "/unit/" + unit.id, null, "PUT", suc, message.writeError, false );
	} );

	// handler untuk menu data pasien pada ruangan
	$( document ).on( 'click', '#menu-ruangan-pasien', function() {
		page.load( $( '#content' ), 'html/feature/data-pasien.html' );
	} );
	
	// handler untuk fungsi mencari data pasien
	$( document ).on( 'click', '#btn-get-data-pasien', function() {
		var kodePasien = $( '#txt-kode-pasien' ).val();
		var succ = function( res ) {
			
			if ( res && res.tipe == 'ERROR' ) {
				alert( "Tidak ada pasien dengan kode: " + kodePasien );
				return;
			}

			var pasien = res.object;
			storage.set( pasien, 'pasien' );
			
			page.change( $( '#pasien-medrek' ), "Medrek: " + pasien.penduduk.kode );
			page.change( $( '#pasien-nama' ), "Nama: " + pasien.nama );
			page.change( $( '#pasien-umur' ), "Umur: " + pasien.umur + " Tahun" );
			page.change( $( '#pasien-kelamin' ), "Jenis Kelamin: " + pasien.kelamin );
			page.change( $( '#pasien-agama'), "Agama: " + pasien.agama );
			page.change( $( '#pasien-kelas'), "Kelas " + pasien.kelas );
			page.change( $( '#pasien-tanggungan'), "Tanggungan " + pasien.penanggung );
			
		};
		
		var pasienRest = rest( server, "patient" );
		pasienRest.call( "/pasien/kode/" + kodePasien, null, "GET", succ, message.writeError, false );
	} );
	
	// handler untuk menyimpan kelas pasien yang baru
	$( document ).on( 'click', '#btn-pasien-kelas-simpan', function() {
		var kelas = $( '#txt-kelas' ).val();
		var pasien = storage.get( 'pasien' );
		
		if ( kelas == "- PILIH -" ) {
			alert( "ERROR: Silahkan memilih kelas" );
			return;
		}
		
		if ( kelas == pasien.kelas ) {
			alert( "ERROR: Kelas yang anda pilih sama dengan kelas pasien saat ini" );
			return;
		}
		
		var succ = function( res ) {
			if ( res && res.tipe == 'ERROR' ) {
				message.success( res );
				return;
			}
			
			page.change( $( '#pasien-kelas' ), "Kelas " + kelas );
			message.success( res, "Kelas pasien berhasil diubah" );
		};
		
		var pasienRest = rest( server, 'patient' );
		pasienRest.call( "/pasien/" + pasien.id + "/kelas/" + kelas, null, "PUT", succ, message.writeError, false );
	} );
	
	// handler untuk menyimpan tanggungan pasien yang baru
	$( document ).on( 'click', '#btn-pasien-tanggungan-simpan', function() {
		var tanggungan = $( '#txt-tanggungan' ).val();
		var pasien = storage.get( 'pasien' );
		
		if ( tanggungan == "- PILIH -" ) {
			alert( 'ERROR: Silahkan memilih tanggungan' );
			return;
		}
		
		if ( tanggungan == pasien.penanggung ) {
			alert( "ERROR: Tanggungan yang anda pilih sama dengan tanggungan pasien saat ini" );
			return;
		}
		
		var succ = function( res ) {
			if ( res && res.tipe == 'ERROR' ) {
				message.success( res );
				return;
			}
			
			page.change( $( '#pasien-tanggungan' ), "Tanggungan " + tanggungan );
			message.success( res, "Tanggungan pasien berhasil diubah" );
		};
		
		var pasienRest = rest( server, 'patient' );
		pasienRest.call( "/pasien/" + pasien.id + "/penanggung/" + tanggungan, null, "PUT", succ, message.writeError, false );
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

function loadData( unit ) {
	var tipe = unit.tipe;
	if ( tipe == "POLIKLINIK" || tipe == "PENUNJANG_MEDIK" ) {
		// DO NOTHING
	} else if ( tipe == "LOKET_PENDAFTARAN" ) {
		// DO NOTHING
	} else if ( tipe == "LOKET_PEMBAYARAN" ) {
		// DO NOTHING
	} else if ( tipe == "RUANG_PERAWATAN" || tipe == "ICU" ) {
		ruanganView.resetRuangan();
	} else if ( tipe == "APOTEK_FARMASI" ) {
		// DO NOTHING
	} else if ( tipe == "UGD" ) {
		// DO NOTHING
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
		var pelayananRest = rest( server, "service");
		var succ = function( res ) {
			
			if ( res.tipe == "ERROR" ) {
				message.success( res.message );
				return;
			}
			
			var pasien = storage.get( 'pasien' );
			pelayananRest.call( "/pelayanan/pasien/" + pasien.id, null, "GET", tagihanView.loadTagihan, message.writeError, false );
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
			tagihanView.setTable( [] );
			return;
		}

		tagihanView.setTable( res.list );
	}
	
};

var ruanganView = {

	resetRuangan: function() {
		var unit = session.getSatuanKerja();
		var pasienRest = rest( server, "patient" );
		pasienRest.call( "/pasien/unit/" + unit.id, null, "GET", ruanganView.loadRuangan, message.writeError, false );
	},
	
	loadRuangan: function( res ) {
		
		if ( res && res.tipe == "ERROR" ) {
			message.success( res );
			ruanganView.setTable( [] );
		} else {
			ruanganView.setTable( res.list );
		}

		if ( res.tipe != "ERROR") {
		}
	},
	
	setTable: function( data ) {
		var html = '';
		var vvip = 0, vip = 0, kelas1 = 0, kelas2 = 0, kelas3 = 0;

		for ( i = 0; i < data.length; i++ ) {
			var pasien = data[ i ];

			html += '<tr>' +
				'<td>' + pasien.kode + '</td>' +
				'<td>' + pasien.penduduk.kode + '</td>' +
				'<td>' + pasien.nama + '</td>' +
				'<td>' +
				'<button type="button" class="btn btn-danger btn-xs pull-right" onclick="ruanganView.outPasien(\'' + pasien.kode + '\')">' +
				'<span class="glyphicon glyphicon-open" aria-hidden="true"></span>' +
				' Keluar Ruangan' +
				'</button>' +
				'</td>' +
				'</tr>';
			
			switch ( pasien.kelas ) {
				case 'VVIP': vvip += 1;
					break;
				case 'VIP': vip += 1;
					break;
				case 'I': kelas1 += 1;
					break;
				case 'II': kelas2 += 1;
					break;
				case 'III': kelas3 += 1;
					break;
			}
		}

		ruanganView.setSum( vvip, vip, kelas1, kelas2, kelas3 );
		page.change( $( '#table-ruangan' ), html );
	},
	
	setSum: function( vvip, vip, kelas1, kelas2, kelas3 ) {
		page.change( $( '#pasien-kelas-vvip' ), vvip + " Orang Pasien VVIP" );
		page.change( $( '#pasien-kelas-vip' ), vip + " Orang Pasien VIP" );
		page.change( $( '#pasien-kelas-1' ), kelas1 + " Orang Pasien Kelas 1" );
		page.change( $( '#pasien-kelas-2' ), kelas2 + " Orang Pasien Kelas 2" );
		page.change( $( '#pasien-kelas-3' ), kelas3 + " Orang Pasien Kelas 3" );
	},
	
	outPasien: function( kode ) {
		var pasienRest = rest( server, "patient" )
		var unit = session.getSatuanKerja();
		var succ = function( res ) {
			message.success( res );
			
			if ( res.tipe != "ERROR" ) {
				pasienRest.call( "/pasien/unit/" + unit.id, null, "GET", ruanganView.loadRuangan, message.writeError, false );
			}
		};
		
		pasienRest.call( "/pasien/" + kode + "/unit", null, "PUT", succ, message.writeError, false );
	}
};

