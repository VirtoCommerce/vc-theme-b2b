$(function () {
	$('.serviceLinks.dropdown, .allProducts.dropdown').on('mouseover', function () {
		$(this).addClass('open');
	}).on('mouseleave', function () {
		$(this).removeClass('open');
	});

	$('.bulkOrderBody.dropdown').on('click', function () {
		if($(this).hasClass('open')) {
			$(this).removeClass('open');
		}
		else {
			$(this).addClass('open');
		}
	});

	$('.seoDescToggle').on('click', function () {
		if($(this).hasClass('collapsed')) {
			$(this).removeClass('collapsed').addClass('close');
			$(this).text('Close');
			$('#seoCopyDesc').show();
		}
		else {
			$(this).removeClass('close').addClass('collapsed');
			$(this).text('About this category');
			$('#seoCopyDesc').hide();
		}
	});
});