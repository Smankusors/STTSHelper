var loggedOn = false, disableMat = false;
function bacaPengumumanSIM() {
	$.get("https://old.sim.stts.edu/pengumuman_data.php", function(result) {
		if ($('#mNewsSIM').attr('class') == "selected") {
			var parsed = parsePengumumanSIM(result);
			$("#content").html(parsed);
			chrome.storage.local.set({'newsSIM':parsed});
			$(".link-pengumuman").click(function(){ window.open(this.href,'_blank'); });
		}
	});
}
$('#logout').click(function (){
	$.post("https://old.sim.stts.edu/logout.php",{},function(){
		loggedOn = false;
		chrome.storage.local.set({'loggedOn':false});
		$(".logout").hide();
		$(".login").show();
	});
});
$('#login').click(function (){
	$('body').fadeOut(100);
	window.setTimeout(function(){ document.location.replace('login.html'); }, 100);
});
$("#mNewsSIM").click(function() {
	$("#mNewsSIM").toggleClass("selected", true);
	$("#mNewsLab").toggleClass("selected", false);
	$("#mSched").toggleClass("selected", false);
	$("#mAbout").toggleClass("selected", false);
	$("#content").fadeOut(100);
	window.setTimeout(function(){
		$("#content").html("");
		chrome.storage.local.get('newsSIM', function(data) {
			if (data.newsSIM) {
				$("#content").html(data.newsSIM);
				$("#content").fadeIn(100);
			}
		});
		bacaPengumumanSIM();
	},100);
});
$("#mNewsLab").click(function() {
	$("#mNewsSIM").toggleClass("selected", false);
	$("#mNewsLab").toggleClass("selected", true);
	$("#mSched").toggleClass("selected", false);
	$("#mAbout").toggleClass("selected", false);
	$("#content").fadeOut(100);
	window.setTimeout(function(){
		$("#content").html("");
		chrome.storage.local.get('newsLab', function(data) {
			if (data.newsLab) {
				$("#content").html(data.newsLab);
				$("#content").fadeIn(100);
			}
		});
		$.get("http://lkomp.stts.edu", function(result) {
			if ($('#mNewsLab').attr('class') == "selected") {
				var hasil = parsePengumumanLab(result);
				$("#content").html(hasil);
				chrome.storage.local.set({'newsLab':hasil});
				$("#content").fadeIn(100);
			}
		});
	},100);
});
$("#mSched").click(function() {
	$("#mNewsSIM").toggleClass("selected", false);
	$("#mNewsLab").toggleClass("selected", false);
	$("#mSched").toggleClass("selected", true);
	$("#mAbout").toggleClass("selected", false);
	$("#content").fadeOut(100);
	window.setTimeout(function(){
		$("#content").html("");
		if (loggedOn) {
			chrome.storage.local.get('sched', function(data) {
				if (data.sched) {
					$("#content").html(data.sched);
					$("#content").fadeIn(100);
				}
			});
			$.get("https://old.sim.stts.edu/jadwal_kul.php", function(kul) {
				$.get("https://old.sim.stts.edu/jadwal_ujian.php", function(ujian){
					$.get("https://old.sim.stts.edu/jadwal_prakecc.php", function(prakecc){
						if ($('#mSched').attr('class') == "selected") {
							var hasil = parseJadwal(kul, ujian, prakecc);
							$("#content").html(hasil);
							$("#content").fadeIn(100);
							chrome.storage.local.set({'sched' : hasil});
						}
					});
				});
			});
		} else {
			$("#content").html('<div class="tengah"><h2>MAAF</h2>Anda harus login dulu sebelum melihat jadwal</div>');
			$("#content").fadeIn(100);
		}
	}, 100);
});
$("#mAbout").click(function() {
	$("#mNewsSIM").toggleClass("selected", false);
	$("#mNewsLab").toggleClass("selected", false);
	$("#mSched").toggleClass("selected", false);
	$("#mAbout").toggleClass("selected", true);
	$("#content").fadeOut(100);
	window.setTimeout(function(){
		$("#content").load("about.html", function() {
			$("#version").html(chrome.runtime.getManifest().version);
			$("#disableMat")[0].checked = disableMat;
			$("#content").fadeIn(100);
			$("#disableMat").click(function (){
				disableMat = $("#disableMat").is(":checked");
				chrome.storage.local.set({'disableMat' : disableMat});
				console.log(disableMat);
			});
		});
	}, 100);
});
chrome.storage.local.get(['newsSIM','loggedOn','user', 'pass', 'nama', 'disableMat'], function(data) {
	disableMat = data.disableMat;
	if (data.newsSIM) $("#content").html(data.newsSIM);
	if (data.loggedOn) {
		loggedOn = true;
		$(".login").hide();
		if (data.nama) $("#nama").html(data.nama);
		$.get( "https://old.sim.stts.edu/index.php", function(result){
			if (!result.includes("Selamat Datang,")) {
				$.post( "https://old.sim.stts.edu/cek_login.php", { user: data.user, pass: data.pass }, function(result){
					if (result != "<script>window.location='index.php'</script>") {
						chrome.storage.local.set({'loggedOn':false});
						loggedOn = false;
						$(".logout").hide();
						$(".login").show();
					}
				});
			}
		});
	} else $(".logout").hide();
	bacaPengumumanSIM();
	chrome.browserAction.setBadgeText({text: ""});
});