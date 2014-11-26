blossom.directive('body', function($window){

	return {

		restrict: 'E',
		
		link: function(scope, element, attrs){

			var loaded = 'content-loaded';

			window.addEventListener( "DOMContentLoaded", function(){

				element.addClass(loaded);

			});

			window.setTimeout(function(){

				if(!element.hasClass(loaded)){

					element.addClass(loaded);
					
				}

			}, 3000);

			Modernizr.csstransforms3d();

			// if(!Modernizr.csstransforms3d){
				
			// 	element.addClass('no-csstransforms3d');

			// };

		}

	};

});
