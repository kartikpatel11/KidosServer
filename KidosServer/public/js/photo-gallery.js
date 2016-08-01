$(document).ready(function(){    
	
	$("#imglist").on("click", "img", function() {
	//$('li img').on('click',function(){
		var src = $(this).attr('src');
		var img = '<img src="' + src + '" class="img-responsive"/>';
		
		//start of new code new code
		var index = $(this).parent('li').index();   
		var html = '';
		html += img;                
		html += '<div style="height:25px;clear:both;display:block;">';
		html += '<a class="controls next" href="'+ (index+2) + '">next &raquo;</a>';
		html += '<a class="controls previous" href="' + (index) + '">&laquo; prev</a>';
		html += '</div>';
		
		$('#myModal').modal();
		$('#myModal').on('shown.bs.modal', function(){
			$('#myModal .modal-body').html(html);
			//new code
			$('a.controls').trigger('click');
		})
		$('#myModal').on('hidden.bs.modal', function(){
			$('#myModal .modal-body').html('');
		});
		
		
		
		
   });
	
	$("#imglist").on("click", "span", function() {
//	$('li span').on('click',function(){
		alert("about to hide");
		var index = $(this).parent().hide();
		
		
	});
	
	$('#remove').on('click', function(){
		//var i=0;
		var total = $('ul.row li').length; 
		for(i=0;i<total;i++)
		{
			var sp= $('ul.row li')[i].getElementsByTagName('span');
			sp[0].style.visibility="visible";
		};
		$('#remove').hide();
		$('#add').hide();
		$('#ok').show();
		$('#cancel').show();
		
	});
	
	$('#cancel').on('click', function(){
		
		var total = $('ul.row li').length; 
		for(i=0;i<total;i++)
		{
			$('ul.row li').show();
			var sp= $('ul.row li')[i].getElementsByTagName('span');
			sp[0].style.visibility="hidden";
			//sp[0].parent().show();
		};
		
		$('#remove').show();
		$('#add').show();
		$('#ok').hide();
		$('#cancel').hide();
		
	});
	
	
	$('#ok').on('click', function(){
		
		var total = $('ul.row li').length; 
		for(i=0;i<total;i++)
		{
			var sp= $('ul.row li')[i].getElementsByTagName('span');
			sp[0].style.visibility="hidden";
		};
		
		var deletelist=[];
		for(i=0;i<total;i++)
		{
			if($('ul.row li')[i].style.display==="none")
			{
				var img=$('ul.row li')[i].getElementsByTagName('img');
				deletelist.push(img[0].src);
				$('ul.row li')[i].remove();
				total=total-1;
			}
			
		};
		
		$('#remove').show();
		$('#add').show();
		$('#ok').hide();
		$('#cancel').hide();
		
	});
})
        
         
$(document).on('click', 'a.controls', function(){
	
	var index = $(this).attr('href');
	var src = $('ul.row li:nth-child('+ index +') img').attr('src');             
	
	$('.modal-body img').attr('src', src);
	
	var newPrevIndex = parseInt(index) - 1; 
	var newNextIndex = parseInt(newPrevIndex) + 2; 
	
	if($(this).hasClass('previous')){               
		$(this).attr('href', newPrevIndex); 
		$('a.next').attr('href', newNextIndex);
	}else{
		$(this).attr('href', newNextIndex); 
		$('a.previous').attr('href', newPrevIndex);
	}
	
	var total = $('ul.row li').length + 1; 
	//hide next button
	if(total === newNextIndex){
		$('a.next').hide();
	}else{
		$('a.next').show()
	}            
	//hide previous button
	if(newPrevIndex === 0){
		$('a.previous').hide();
	}else{
		$('a.previous').show()
	}
	
	
	return false;
});