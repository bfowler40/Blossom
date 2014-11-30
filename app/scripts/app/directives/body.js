blossom.directive('body', function(){

	return {

		restrict: 'E',
		
		link: function(scope, element, attrs){

			var img = new Image();
			img.src = attrs.background;

			img.onload = function(){
				
				element.addClass('content-loaded');

			}

		}

	};

});
