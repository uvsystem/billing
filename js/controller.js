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

	if ( !operator.isAuthorized() ) {
		window.location.href = 'login.html';
		return;
	}
	storage.reset();

	page.change( $( '#operator-nama' ), operator.getName() );
	page.setName( 'HOME' );
	
	var navDef = navigation( operator.getUsername() == 'superuser' ? 'ADMIN' : operator.getRole() );
	page.change( $( '#nav-menu' ), navDef );

	$( function () {
		$( '[ data-toggle = "tooltip" ]' ).tooltip();
	} );

	
	
	// Menu Handlers
	$( document ).on( 'click', '#menu-skpd', function() {

		page.change( $( '#message' ), '');
		unitKerjaDomain.reload();

	} );

	$( document ).on( 'click', '#menu-jabatan', function() {

		page.change( $( '#message' ), '');
		jabatanDomain.reload();

	} );

	$( document ).on( 'click', '#menu-pegawai', function() {
		
		page.change( $( '#message' ), '');
		pegawaiDomain.reload();

	} );

	$( document ).on( 'click', '#menu-kalendar', function() {
		
		page.change( $( '#message' ), '');
		kalendarDomain.reload();

	} );

	$( document ).on( 'click', '#menu-rekap', function() {
		
		page.change( $( '#message' ), '');
		rekap.reload();
		
	} );

	$( document ).on( 'click', '#menu-absensi', function() {
		
		page.change( $( '#message' ), '');
		absenDomain.reload();

	} );

	$( document ).on( 'click', '#menu-sppd', function() {
		
		page.change( $( '#message' ), '');
		sppdDomain.reload();

	} );

	$( document ).on( 'click', '#menu-spt', function() {
		
		page.change( $( '#message' ), '');
		sptDomain.reload();

	} );

	$( document ).on( 'click', '#menu-aplikasi', function() {
		
		page.change( $( '#message' ), '');
		aplikasiDomain.reload();

	} );

	// handler untuk logout
	$( document ).on( 'click', '#nav-logout', function() {
		
		page.change( $( '#message' ), '');
		ehrmRestAdapter.logout();

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

	
	
	// SKPD Handler
	$( document ).on( 'click', '#btn-skpd-tambah', function() {
	
		page.change( $( '#unitkerja-list' ), page.list.dataList.generateFromStorage( unitKerjaDomain.nama, 'unitkerja-list' ) );
		
		$( '#form-skpd-parent' ).val( '' );
		$( '#form-skpd-kode' ).val( '' );
		$( '#form-skpd-nama' ).val( '' );
		
		unitKerjaDomain.currentId = 0;

	} );
	
	$( document ).on( 'click', '#btn-simpan-skpd', function() {

		var id = unitKerjaDomain.currentId;
		var kode = $( '#form-skpd-kode' ).val();
		var nama = $( '#form-skpd-nama' ).val();
		var tipe = $( '#form-skpd-tipe' ).val();
		
		var onSuccess = function ( result ) {

			message.success( result );
			unitKerjaDomain.reload();

		};

		var namaParent = $( '#form-skpd-parent' ).val();
		if ( namaParent != '' ) {
			
			var parent = storage.getByNama( unitKerjaDomain, namaParent );
			var kodeParent = ( parent ? parent.singkatan : '' );

			unitKerjaRestAdapter.addSubUnit( kodeParent, id, nama, tipe, kode, onSuccess);
			
		} else {

			unitKerjaRestAdapter.save( id, nama, tipe, kode, onSuccess);
		
		}
	} );

	$( document ).on( 'click', '#btn-hapus-skpd', function() {
		throw new Error( 'Not Yet Implemented' );
	} );

	$( document ).on( 'change', '#satker-satuan-kerja', function() {
		
		page.change( $( '#message' ), '');
		var satker = storage.getByNama( unitKerjaDomain, $( '#satker-satuan-kerja' ).val() );
		
		unitKerjaRestAdapter.findSubUnit( satker.singkatan, function( result ) {
			unitKerjaDomain.load( result.list );
		});
		
		$( '#text-pegawai-satuan-kerja' ).val( satker.nama );
	} );


	// Absen handler.
	$( document ).on( 'click', '#btn-absen-tambah', function() {
		
		$( '#form-absen-nip' ).val( '' );
		$( '#form-absen-tanggal' ).val( '' );
		$( '#form-absen-pagi' ).val( '7:30' );
		$( '#form-absen-tengah' ).val( '11:30' );
		$( '#form-absen-siang' ).val( '13:00' );
		$( '#form-absen-sore' ).val( '16:00' );
		
	} );
	
	$( document ).on( 'click', '#btn-absen-simpan', function() {

	
		var nip = $( '#form-absen-nip' ).val();
		var tanggal = myDate.fromDatePicker( $( '#form-absen-tanggal' ).val() );
		var pagi = $( '#form-absen-pagi' ).val();
		var cek1 = $( '#form-absen-tengah' ).val();
		var cek2 = $( '#form-absen-siang' ).val();
		var sore = $( '#form-absen-sore' ).val();

		absenRestAdapter.hadir( nip, tanggal.getFormattedString(), pagi, cek1, cek2, sore, function( result ) {
			message.success( result );
			absenDomain.reload();
		});
	} );
	
	$( document ).on( 'click', '#btn-absen-sakit', function() {
	
		$( '#form-absen-sakit-nip' ).val( '' );
		$( '#form-absen-sakit-tanggal' ).val( '' );
		$( '#form-absen-sakit-keterangan' ).val( '' );
		
	} );

	$( document ).on( 'click', '#btn-absen-sakit-simpan', function() {
		
		var nip = $( '#form-absen-sakit-nip' ).val();
		var keterangan = $( '#form-absen-sakit-keterangan' ).val();
		var tanggal = myDate.fromDatePicker( $( '#form-absen-sakit-tanggal' ).val() );
		
		absenRestAdapter.sakit( nip, tanggal.getFormattedString(), function( result ) {
			message.success( result );
			absenDomain.reload();
		} );
		
	} );
	
	$( document ).on( 'click', '#btn-absen-izin', function() {
	
		$( '#form-absen-izin-nip' ).val( '' );
		$( '#form-absen-izin-tanggal' ).val( '' );
		$( '#form-absen-izin-keterangan' ).val( '' );
				
	} );

	$( document ).on( 'click', '#btn-absen-izin-simpan', function() {
		
		var nip = $( '#form-absen-izin-nip' ).val();
		var keterangan = $( '#form-absen-izin-keterangan' ).val();
		var tanggal = myDate.fromDatePicker( $( '#form-absen-izin-tanggal' ).val() );
		
		absenRestAdapter.izin( nip, tanggal.getFormattedString(), function( result ) {
			message.success( result );
			absenDomain.reload();
		} );
	} );
	
	$( document ).on( 'click', '#btn-absen-cuti', function() {
	
		$( '#form-absen-cuti-nip' ).val( '' );
		$( '#form-absen-cuti-tanggal' ).val( '' );
		$( '#form-absen-cuti-keterangan' ).val( '' );
				
	} );

	$( document ).on( 'click', '#btn-absen-cuti-simpan', function() {
		
		var nip = $( '#form-absen-cuti-nip' ).val();
		var keterangan = $( '#form-absen-cuti-keterangan' ).val();
		var tanggal = myDate.fromDatePicker( $( '#form-absen-cuti-tanggal' ).val() );
		
		absenRestAdapter.cuti( nip, tanggal.getFormattedString(), function( result ) {
			message.success( result );
			absenDomain.reload();
		} );
	} );
	
	$( document ).on( 'click', '#absen-cari', function() {
		
		var unitKerja = storage.getByNama( unitKerjaDomain, $( '#absen-satuan-kerja' ).val() );
		var tanggal = myDate.fromDatePicker( $( '#absen-tanggal' ).val() );

		absenRestAdapter.findBySatker( unitKerja.singkatan, tanggal.getFormattedString(), function( result ) {
			absenDomain.load( ( result ? result.list : [] ) );
			
			$( '#absen-satuan-kerja' ).val( unitKerja.nama );
			$( '#absen-tanggal' ).val( tanggal.getDatePickerString() );
		});
	} );

	$( document ).on( 'change', '#form-absen-nip', function() {
		
		var nip = $( '#form-absen-nip' ).val();
		var tmp = pegawaiDomain.getByNip( nip );
		
		$( '#form-absen-nama' ).val( tmp.nama );
		
	} );
	
	
	// Pegawai handler(s).
	$( document ).on( 'click', '#btn-pegawai-tambah', function() {
			
		$( '#form-pegawai-nip' ).val( '' );
		$( '#form-pegawai-nik' ).val( '' );
		$( '#form-pegawai-nama' ).val( '' );
		$( '#form-pegawai-tanggal-lahir' ).val( '' );
		$( '#form-pegawai-password' ).val( '' );

		pegawaiDomain.currentId = 0;
		pegawaiDomain.currentIdPenduduk = 0;
		pegawaiDomain.currentIdUnitKerja = pegawaiDomain.idSekretariatDaerah();

	} );

	$( document ).on( 'click', '#btn-simpan-pegawai', function() {

		var idSatuanKerja = pegawaiDomain.currentIdUnitKerja;
		var id = pegawaiDomain.currentId;
		var idPenduduk = pegawaiDomain.currentIdPenduduk;
		var nip = $( '#form-pegawai-nip' ).val();
		var nik = $( '#form-pegawai-nik' ).val();
		var nama = $( '#form-pegawai-nama' ).val();
		var tanggalLahir = myDate.fromDatePicker( $( '#form-pegawai-tanggal-lahir' ).val() );
		var pangkat = $( '#form-pegawai-pangkat' ).val();
		var eselon = $( '#form-pegawai-eselon' ).val();
		var namaJabatan = $( '#form-pegawai-jabatan' ).val();
		var password = $( '#form-pegawai-password' ).val();
		
		if ( !password )
			password = 'password';

		var pegawai = {
			id: id,
			nip: nip,
			passwordStr: password,
			nik: nik,
			nama: nama,
			tanggalLahirStr: tanggalLahir.getFormattedString(),
			email: '',
			telepon: '',
			pangkat: pangkat,
			namaJabatan: namaJabatan,
			eselon: eselon,
			idPenduduk: idPenduduk
		};

		pegawaiRestAdapter.saveDirect( idSatuanKerja, pegawai, pegawaiDomain.success );

		// pegawaiRestAdapter.save( idSatuanKerja, id, nip, password, nik, nama, tanggalLahir.getFormattedString(), '', '', idPenduduk, pegawaiDomain.success );
	} );
	
	$( document ).on( 'click', '#btn-simpan-mutasi', function() {
		
		var pegawai = storage.getById( pegawaiDomain, pegawaiDomain.currentId );
		var nip = pegawai.nip;
		
		var namaUnitKerja = $( '#form-mutasi-unit-kerja' ).val();
		var unitKerja = storage.getByNama( unitKerjaDomain, namaUnitKerja );
		var kode = unitKerja.singkatan;

		pegawaiRestAdapter.mutasi( nip, kode, pegawaiDomain.success );
	} );
	
	$( document ).on( 'click', '#btn-simpan-promosi-pangkat', function() {
		
		var pegawai = storage.getById( pegawaiDomain, pegawaiDomain.currentId );
		var nip = pegawai.nip;
		var pangkat = $( '#form-promosi-pangkat-pangkat' ).val();
		var nomorSk = $( '#form-promosi-pangkat-nomor-sk' ).val();
		var tanggalMulai = myDate.fromDatePicker( $( '#form-promosi-pangkat-tanggal-mulai' ).val() );
		var tanggalSelesai = $( '#form-promosi-pangkat-tanggal-selesai' ).val();
		if ( tanggalSelesai ) {
			var tanggal = myDate.fromDatePicker( tanggalSelesai );
			tanggalSelesai = tanggal.getFormattedString();
		}

		pegawaiRestAdapter.promosiPangkat( nip, pangkat, nomorSk, tanggalMulai.getFormattedString(), tanggalSelesai, pegawaiDomain.success );
	} );
	
	$( document ).on( 'click', '#btn-simpan-promosi-jabatan', function() {
		
		var pegawai = storage.getById( pegawaiDomain, pegawaiDomain.currentId );
		var nip = pegawai.nip;
		var jabatan = storage.getByNama( jabatanDomain, $( '#form-promosi-jabatan-jabatan' ).val() );
		var nomorSk = $( '#form-promosi-jabatan-nomor-sk' ).val();
		var tanggalMulai = myDate.fromDatePicker( $( '#form-promosi-jabatan-tanggal-mulai' ).val() );
		var tanggalSelesai = $( '#form-promosi-jabatan-tanggal-selesai' ).val();
		if ( tanggalSelesai ) {
			var tanggal = myDate.fromDatePicker( tanggalSelesai );
			tanggalSelesai = tanggal.getFormattedString();
		}

		pegawaiRestAdapter.promosiJabatan( nip, jabatan.id, nomorSk, tanggalMulai.getFormattedString(), tanggalSelesai, pegawaiDomain.success );
	} );

	$( document ).on( 'change', '#text-pegawai-satuan-kerja', function() {
		
		page.change( $( '#message' ), '');
		var satker = storage.getByNama( unitKerjaDomain, $( '#text-pegawai-satuan-kerja' ).val() );
		
		pegawaiRestAdapter.findBySatker( satker.id, function( result ) {
			pegawaiDomain.load( result.list );
		});
		
		$( '#text-pegawai-satuan-kerja' ).val( satker.nama );
	} );
	
	
	// Jabatan Handler
	$( document ).on( 'click', '#btn-jabatan-tambah', function() {

		$( '#form-jabatan-satuan-kerja' ).val( '' );
		$( '#form-jabatan-eselon' ).val( '' );
		$( '#form-jabatan-pangkat' ).val( '' );
		$( '#form-jabatan-nama' ).val( '' );

		jabatanDomain.currentId = 0;

	} );
	
	$( document ).on( 'click', '#btn-simpan-jabatan', function() {

		var satker = storage.getByNama( unitKerjaDomain, $( '#form-jabatan-satuan-kerja' ).val() );
		var id = jabatanDomain.currentId;
		var eselon = $( '#form-jabatan-eselon' ).val();
		var pangkat = $( '#form-jabatan-pangkat' ).val();
		var nama = $( '#form-jabatan-nama' ).val();

		jabatanRestAdapter.save( satker.id, id, eselon, pangkat, nama, function( result ) {
			message.success( result );
			jabatanDomain.reload();
		});
	} );

	$( document ).on( 'change', '#text-jabatan-satuan-kerja', function() {
		
		page.change( $( '#message' ), '');
		var satker = storage.getByNama( unitKerjaDomain, $( '#text-jabatan-satuan-kerja' ).val() );
		
		jabatanRestAdapter.findBySatker( satker.id, function( result ) {
			jabatanDomain.load( result.list );
		});
		
		$( '#text-jabatan-satuan-kerja' ).val( satker.nama );
	} );

	
	// Kalendar Handler
	$( document ).on( 'click', '#btn-simpan-kalendar', function() {

		var tanggal = myDate.fromDatePicker( $( '#form-kalendar-tanggal' ).val() );
		var tanggalAkhir = myDate.fromDatePicker( $( '#form-kalendar-tanggal-akhir' ).val() );
		
		var dAwal = new Date(tanggal.year, ( tanggal.month - 1 ), tanggal.day);
		var dAkhir = new Date(tanggalAkhir.year, ( tanggalAkhir.month - 1 ), tanggalAkhir.day);

		for ( var d = dAwal; d <= dAkhir; d.setDate( d.getDate() + 1 ) ) {
			var dObject = myDate.fromDate( d );

			kalendarRestAdapter.add( dObject.getFormattedString(), function( result ) {
				message.success( result );
				// kalendarDomain.reload();
			});
		}
	} );
	
	$( document ).on( 'change', '#text-tanggal-awal', function() {
		page.change( $( '#message' ), '');

		var awalStr = $( '#text-tanggal-awal' ).val();
		var akhirStr = $( '#text-tanggal-akhir' ).val();
		
		var awal = awalStr ? myDate.fromDatePicker( awalStr ) : null;
		var akhir = akhirStr ? myDate.fromDatePicker( akhirStr ) : null;
		
		if ( awal && akhir && awal.isBefore( akhir ) ) {
			kalendarRestAdapter.findRange( awal.getFormattedString(), akhir.getFormattedString(), function( result ) {
				kalendarDomain.load( result.list );
		
				$( '#text-tanggal-awal' ).val( awalStr );
				$( '#text-tanggal-akhir' ).val( akhirStr );
			});
		}
	} );
	
	$( document ).on( 'change', '#text-tanggal-akhir', function() {

		page.change( $( '#message' ), '');
		
		var awalStr = $( '#text-tanggal-awal' ).val();
		var akhirStr = $( '#text-tanggal-akhir' ).val();
		
		var awal = awalStr ? myDate.fromDatePicker( awalStr ) : null;
		var akhir = akhirStr ? myDate.fromDatePicker( akhirStr ) : null;
		
		if ( awal && akhir && awal.isBefore( akhir ) ) {
			kalendarRestAdapter.findRange( awal.getFormattedString(), akhir.getFormattedString(), function( result ) {
				kalendarDomain.load( result.list );
		
				$( '#text-tanggal-awal' ).val( awalStr );
				$( '#text-tanggal-akhir' ).val( akhirStr );
			});
		}
	} );
	
	
	// SPT Controller
	$( document ).on( 'click', '#btn-spt-tambah', function() {
		$( '#form-spt-nomor' ).val( '' );
		$( '#form-spt-jumlah-hari' ).val( '' );
		$( '#form-spt-tujuan' ).val( '' );
		$( '#form-spt-maksud' ).val( '' );
	} );
	
	$( document ).on( 'click', '#btn-simpan-spt', function() {

		var id = sptDomain.currentId;
		var nomor = $( '#form-spt-nomor' ).val();
		var jumlahHari = $( '#form-spt-jumlah-hari' ).val();
		var tujuan = $( '#form-spt-tujuan' ).val();
		var maksud = $( '#form-spt-maksud' ).val();
	
		suratTugasRestAdapter.add( id, nomor, jumlahHari, tujuan, maksud, sptDomain.success );
	} );

	$( document ).on( 'click', '#btn-simpan-pemegang-tugas', function() {
		
		var id = sptDomain.currentId;
		var nip = $( '#form-pemegang-tugas-nip' ).val();
		
		suratTugasRestAdapter.addPemegangTugas( id, nip, sptDomain.success );
	} );

	$( document ).on( 'change', '#spt-satuan-kerja', function() {

		page.change( $( '#message' ), '');

		var satuanKerja = storage.getByNama( unitKerjaDomain, $( '#spt-satuan-kerja' ).val() );
		
		suratTugasRestAdapter.findBySatker( satuanKerja.singkatan, function( result ) {
			sptDomain.load( result.list );
			$( '#spt-satuan-kerja' ).val( satuanKerja.nama )
		});
	} );

	
	// SPPD Controller
	$( document ).on( 'click', '#btn-sppd-tambah', function() {
	
		sppdDomain.currentId = 0;
		$( '#form-sppd-nip' ).val( '' );
		$( '#form-sppd-nomor-spt' ).val( '' );
		$( '#form-sppd-nomor' ).val( '' );
		$( '#form-sppd-tanggal-berangkat' ).val( '' );
		$( '#form-sppd-transportasi' ).val( '' );
		$( '#form-sppd-kode-rekening' ).val( '' );
		$( '#form-sppd-nomor-dpa' ).val( '' );
		$( '#form-sppd-tingkat' ).val( '' );
	} );
	
	$( document ).on( 'click', '#btn-simpan-sppd', function() {

		var id = sppdDomain.currentId;
		var nip = $( '#form-sppd-nip' ).val();
		var nomorSuratTugas = $( '#form-sppd-nomor-spt' ).val();
		var nomor = $( '#form-sppd-nomor' ).val();
		var tanggalBerangkat = myDate.fromDatePicker( $( '#form-sppd-tanggal-berangkat' ).val() );
		var transportasi = $( '#form-sppd-transportasi' ).val();
		var kodeRekening = $( '#form-sppd-kode-rekening' ).val();
		var nomorDpa = $( '#form-sppd-nomor-dpa' ).val();
		var tingkat = $( '#form-sppd-tingkat' ).val();
		
		sppdRestAdapter.save( id, nip, nomorSuratTugas, nomor, tanggalBerangkat.getFormattedString(), transportasi, kodeRekening, nomorDpa, tingkat, sppdDomain.success );
		
	} );

	$( document ).on( 'click', '#btn-simpan-pengikut', function() {

		var sppd = storage.getById( sppdDomain, sppdDomain.currentId );
		var nama = $( '#form-pengikut-nama' ).val();
		var tanggalLahir = myDate.fromDatePicker( $( '#form-pengikut-tanggal-lahir' ).val() );
		var keterangan = $( '#form-pengikut-keterangan' ).val();
		
		sppdRestAdapter.addFollower( sppd.nomor, nama, tanggalLahir.getFormattedString(), keterangan, sppdDomain.success );
		
	} );

	$( document ).on( 'change', '#sppd-satuan-kerja', function() {

		page.change( $( '#message' ), '');

		var satuanKerja = storage.getByNama( unitKerjaDomain, $( '#sppd-satuan-kerja' ).val() );
		
		sppdRestAdapter.findBySatker( satuanKerja.singkatan, function( result ) {
			sppdDomain.load( result.list );
			$( '#sppd-satuan-kerja' ).val( satuanKerja.nama )
		});
	} );



	// Aplikasi Controller
	$( document ).on( 'click', '#btn-aplikasi-tambah', function() {
	
		aplikasiDomain.currentId = 0;
		$( '#form-aplikasi-kode' ).val( '' );
		$( '#form-aplikasi-nama' ).val( '' );
		$( '#form-aplikasi-url' ).val( '' );
		
	} );
	
	$( document ).on( 'click', '#btn-simpan-aplikasi', function() {

		var id = aplikasiDomain.currentId;
		var kode = $( '#form-aplikasi-kode' ).val();
		var nama = $( '#form-aplikasi-nama' ).val();
		var url = $( '#form-aplikasi-url' ).val();
		
		aplikasiRestAdapter.add( id, kode, nama, url, aplikasiDomain.success );
		
	} );

	$( document ).on( 'click', '#btn-simpan-operator', function() {

		var aplikasi = storage.getById( aplikasiDomain, aplikasiDomain.currentId );
		var nip = $( '#form-operator-nip' ).val();
		var role = aplikasiDomain.roleOperator;;

		if ( role == 'ADMIN' ) {
			aplikasiRestAdapter.addAdmin( aplikasi.kode, nip, aplikasiDomain.success );
		} if ( role == 'OPERATOR' ) {
			aplikasiRestAdapter.addOperator( aplikasi.kode, nip, aplikasiDomain.success );
		}
	} );

	$( document ).on( 'change', '#form-operator-nip', function() {
		
		var nip = $( '#form-operator-nip' ).val();
		var pegawai = pegawaiDomain.getByNip( nip );
		$( '#form-operator-nama' ).val( pegawai.nama );
		
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
		
		if ( !halaman )
			
			throw new Error( 'Nama halaman belum di atur' );
		
		if ( halaman == pegawaiDomain.nama ) {

			pegawaiRestAdapter.search( kataKunci, function( result ) {
				pegawaiDomain.load( result.list );
			});
			
		} else if ( halaman == unitKerjaDomain.nama ) {
		
			unitKerjaRestAdapter.search( kataKunci, function( result ) {
				unitKerjaDomain.load( result.list );
			});
			
		} else if ( halaman == jabatanDomain.nama ) {
		
			jabatanRestAdapter.search( kataKunci, function( result ) {
				jabatanDomain.load( result.list );
			});
			
		} else if ( halaman == sptDomain.nama ) {
		
			suratTugasRestAdapter.search( kataKunci, function( result ) {
				sptDomain.load( result.list );
			});
			
		} else if ( halaman == sppdDomain.nama ) {
		
			sppdRestAdapter.search( kataKunci, function( result ) {
				sppdDomain.load( result.list );
			});
			
		} else if ( halaman == absenDomain.nama ) {
			
			absenDomain.searchBy = true;
		
			absenRestAdapter.search( kataKunci, function( result ) {
				absenDomain.load( result.list );
			});
			
		} else {

			throw new Error( 'Nama halaman tidak terdaftar : ' + halaman );
			
		}
	} );
	
	// Rekap Handler
	$( document ).on( 'click', '#btn-cetak-rekap-absen', function() {

		var awal = myDate.fromDatePicker( $( '#form-rekap-absen-tanggal-awal' ).val() );
		var akhir = myDate.fromDatePicker( $( '#form-rekap-absen-tanggal-akhir' ).val() );
		
		printer.submitPost( target + '/ehrm/absen/rekap/' + awal.getFormattedString() + '/' + akhir.getFormattedString() + '/cetak', [], 'GET' );
		
	});

	$( document ).on( 'click', '#btn-rekap-sppd-cetak', function() {

		var tahun = $( '#form-rekap-sppd-tahun' ).val();
		
		printer.submitPost( target + '/ehrm/sppd/rekap/tahun/' + tahun + '/cetak', [], 'GET' );
		
	});
	
	// Alert auto-close
	$("#success-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
	$("#warning-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
	$("#error-alert").fadeTo(2000, 500).slideUp(500, function(){
	    $("#success-alert").alert('close');
	});
	
} );

function navigation( role ) {
	if ( role == "ADMIN" ) {
		
		return '' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-skpd" href="#" data-toggle="tooltip" data-placement="right" title="Unit Kerja"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Unit Kerja</b></a></li>' +
			// '<li><a id="menu-jabatan" href="#" data-toggle="tooltip" data-placement="right" title="Jabatan"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Jabatan</b></a></li>' +
			'<li><a id="menu-pegawai" href="#" data-toggle="tooltip" data-placement="right" title="Pegawai"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Pegawai</b></a></li>' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-kalendar" href="#" data-toggle="tooltip" data-placement="right" title="Kalendar"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Kalendar</b></a></li>' +
			'<li><a id="menu-absensi" href="#" data-toggle="tooltip" data-placement="right" title="Absensi"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Absensi</b></a></li>' +
			// '<li class="divider">&nbsp;</li>' +
			// '<li><a id="menu-spt" href="#" data-toggle="tooltip" data-placement="right" title="SPT"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Surat Tugas</b></a></li>' +
			// '<li><a id="menu-sppd" href="#" data-toggle="tooltip" data-placement="right" title="SPPD"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">SPPD</b></a></li>' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-rekap" href="#" data-toggle="tooltip" data-placement="right" title="Rekap"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Rekap</b></a></li>' +
			'<li><a id="menu-aplikasi" href="#" data-toggle="tooltip" data-placement="right" title="Aplikasi"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Aplikasi</b></a></li>';

	} else if ( role == "OPERATOR" ) {
		
		return '' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-skpd" href="#" data-toggle="tooltip" data-placement="right" title="Unit Kerja"><span class="glyphicon glyphicon-home big-icon"></span><b class="icon-text">Unit Kerja</b></a></li>' +
			// '<li><a id="menu-jabatan" href="#" data-toggle="tooltip" data-placement="right" title="Jabatan"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Jabatan</b></a></li>' +
			'<li><a id="menu-pegawai" href="#" data-toggle="tooltip" data-placement="right" title="Pegawai"><span class="glyphicon glyphicon-user big-icon"></span><b class="icon-text">Pegawai</b></a></li>' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-kalendar" href="#" data-toggle="tooltip" data-placement="right" title="Kalendar"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Kalendar</b></a></li>' +
			'<li><a id="menu-absensi" href="#" data-toggle="tooltip" data-placement="right" title="Absensi"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Absensi</b></a></li>' +
			// '<li class="divider">&nbsp;</li>' +
			// '<li><a id="menu-spt" href="#" data-toggle="tooltip" data-placement="right" title="SPT"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">Surat Tugas</b></a></li>' +
			// '<li><a id="menu-sppd" href="#" data-toggle="tooltip" data-placement="right" title="SPPD"><span class="glyphicon glyphicon-calendar big-icon"></span><b class="icon-text">SPPD</b></a></li>' +
			'<li class="divider">&nbsp;</li>' +
			'<li><a id="menu-rekap" href="#" data-toggle="tooltip" data-placement="right" title="Rekap"><span class="glyphicon glyphicon-briefcase big-icon"></span><b class="icon-text">Rekap</b></a></li>';

	} else {
		throw new Error( "Role: '" + role + "' is unknown" );
	}
};
