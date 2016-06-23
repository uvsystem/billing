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
	
	var navDef = navigation( role, session.getSatuanKerja() );
	page.change( $( '#nav-menu' ), navDef );

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

function navigation( role, unit ) {
	if ( role == "ADMIN" ) {
		
		return '' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-admin-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Admin 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Admin 1</b></a></li>' +
			'<li><a id="menu-admin-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Admin 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Admin 2</b></a></li>' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-admin-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Admin 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Admin 3</b></a></li>';

	} else if ( role == "OPERATOR" ) {
		
		
		var tipe = unit.tipe;
		if ( tipe == "POLIKLINIK" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-poliklinik-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Poliklinik 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Poliklinik 1</b></a></li>' +
				'<li><a id="menu-poliklinik-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Poliklinik 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Poliklinik 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-poliklinik-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Poliklinik 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Poliklinik 3</b></a></li>';
			
		} else if ( tipe == "LOKET_PENDAFTARAN" || tipe == "PENUNJANG_MEDIK" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-pendaftaran-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pendaftaran 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Pendaftaran 1</b></a></li>' +
				'<li><a id="menu-pendaftaran-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pendaftaran 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Pendaftaran 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-pendaftaran-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pendaftaran 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Pendaftaran 3</b></a></li>';
			
		} else if ( tipe == "LOKET_PEMBAYARAN" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-pembayaran-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pembayaran 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Pembayaran 1</b></a></li>' +
				'<li><a id="menu-pembayaran-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pembayaran 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Pembayaran 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-pembayaran-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Pembayaran 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Pembayaran 3</b></a></li>';
			
		} else if ( tipe == "RUANG_PERAWATAN" || tipe == "ICU" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-ruangan-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ruangan 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Ruangan 1</b></a></li>' +
				'<li><a id="menu-ruangan-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ruangan 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Ruangan 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-ruangan-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ruangan 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Ruangan 3</b></a></li>';

		} else if ( tipe == "APOTEK_FARMASI" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-apotek-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Apotek 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Apotek 1</b></a></li>' +
				'<li><a id="menu-apotek-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Apotek 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Apotek 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-apotek-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Apotek 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Apotek 3</b></a></li>';
				
		} else if ( tipe == "UGD" ) {
			
			return '' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-ugd-1" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ugd 1"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Menu Ugd 1</b></a></li>' +
				'<li><a id="menu-ugd-2" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ugd 2"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Menu Ugd 2</b></a></li>' +
				'<li class="divider">&nbsp;</li>' +
				'<li><a id="menu-ugd-3" href="#" data-toggle="tooltip" data-placement="right" title="Menu Ugd 3"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Menu Ugd 3</b></a></li>';
				
		}

	} else {
		throw new Error( "Role: '" + role + "' is unknown" );
	}
};
