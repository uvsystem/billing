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

	// handler untuk membuka modal 
	$( document ).on( 'click', '#btn-ubah-password', function() {

		var password = $( '#form-password' ).val();
		var pegawai = operator.getPegawai();

		pegawaiRestAdapter.updatePassword( pegawai.id, password, function( result ) {
			message.success( result );
		} );
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

