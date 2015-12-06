$(function(){
	var getInnerHeight = function() {
		return window.innerHeight || document.documentElement.clientHeight;
	};
	$(window).resize(function() { 
		$(".showdiv").width($(".gridcon img").width());
		$(".popupBg").height(getInnerHeight());
	}).resize(); 
	$(".sortBy a").click(function() {
		$(this).toggleClass("up");
	}); 
	
	var isShow = false;
	$(".showAndHideQuota a").click(function() {
		if(isShow) {
			$(".showAndHideQuota a").removeClass("show");
			$(".quotaBar").slideDown(300);
			$(".showAndHideQuota a").text("Hide Quota");
		} else { 
			$(".showAndHideQuota a").addClass("show");
			$(".quotaBar").slideUp(300);
			$(".showAndHideQuota a").text("Show Quota");
		}
		isShow = !isShow;
	});
	
	$(".advancedSearch a").click(function(){
		$(".advancedSearch a span").toggleClass("expand");
		$(".arrowbg").slideToggle(300);
		$(".searchCriteria").slideToggle(300);
	});
	
	$(".gridcon a").mouseenter(function() {
		//hover
		$(this).find("div.showdiv").stop(true, true).animate({
			"height" : 200
		}, 300, 'swing');
		
	}).mouseleave(function() {
		//leave
		var self = this;
		$(this).find("div.showdiv").stop(true, false).animate({
			"height" : 30
		}, 300);
	});
	$(".popupAction").click(function(){
		$(".popupBg").fadeIn(300);
	});
	$(".popupBg").click(function() {
		$(this).fadeOut(300);
	});
});