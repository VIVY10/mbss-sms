/////////////////////////reset password////////////////////////////////////////////////
document.getElementById('resetPasswordFormBtn').addEventListener('click', function (event){	
    event.preventDefault();
	const form = $("#resetPasswordForm")[0];
	const formData = Object.fromEntries(new FormData(form).entries());

	var xmlhttp = new XMLHttpRequest();
	var url = "/resetPassword";
	xmlhttp.open("post", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify(formData));
	xmlhttp.onreadystatechange = function(data){
	    if(this.readyState == 4 && this.status == 200){
          
            alert(data.message)
	    }else if(this.readyState == 4 && this.status == 500){
        
            alert(data.message)
        }
	}
});
