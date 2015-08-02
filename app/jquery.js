$(function() {
	// Sidebar functionality {{{
	// Originally from the Material Admin theme with some rewriting by MC
	// Toggle
	$('body')
		.on('click', '#menu-trigger', function(e){
			var $elem;
			var $elem2;

			e.preventDefault();
			var x = $(this).data('trigger');

			$(x).toggleClass('toggled');
			$(this).toggleClass('open');
			$('body').toggleClass('modal-open');

			//Close opened sub-menus
			$('.sub-menu.toggled').not('.active').each(function(){
				$(this).removeClass('toggled');
				$(this).find('ul').hide();
			});
		})
		.on('click', '#content, #sidebar a[href]', function(e) { // When clicking on #content OR <a href> items within the sidebar - close the sidebar
			if (!$('#sidebar').hasClass('toggled')) return; // Sidebar not open
			$('body').removeClass('modal-open');
			$('#sidebar').removeClass('toggled');
			$('#menu-trigger').removeClass('open');
		});
	// }}}

	// Sidebar Submenus {{{
	$('body').on('click', '.sub-menu > a', function(e){
		e.preventDefault();
		$(this).next().slideToggle(200);
		$(this).parent().toggleClass('toggled');
	});
	// }}}

	// FIXME - Init Bootstrap tooltips - does not seem to initialise tooltips
  $('[data-toggle="tooltip"]').tooltip();
});
