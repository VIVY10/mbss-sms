// /////////////////////////reset password////////////////////////////////////////////////
// document.getElementById('resetPasswordFormBtn').addEventListener('click', function (event){	
//     event.preventDefault();
// 	const form = $("#resetPasswordForm")[0];
// 	const formData = Object.fromEntries(new FormData(form).entries());

// 	var xmlhttp = new XMLHttpRequest();
// 	var url = "/resetPassword";
// 	xmlhttp.open("post", url, true);
// 	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
// 	xmlhttp.send(JSON.stringify(formData));
// 	xmlhttp.onreadystatechange = function(data){
// 	    if(this.readyState == 4 && this.status == 200){
          
//             alert(data.message)
// 	    }else if(this.readyState == 4 && this.status == 500){
        
//             alert(data.message)
//         }
// 	}
// });

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resetPasswordForm");
    const button = document.getElementById("rpBtn");

    if (!form || !button) {
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const password1 = document.getElementById("password1").value;
        const password2 = document.getElementById("password2").value;

        if (password1.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (password1 !== password2) {
            alert("The passwords do not match.");
            return;
        }

        button.disabled = true;
        button.textContent = "Resetting...";

        try {
            const formData = new FormData(form);

            const response = await fetch("/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    Object.fromEntries(formData.entries())
                )
            });

            const data = await response.json();

            if (response.ok && data.status === "ok") {
                alert(data.message);

                form.remove();
                return;
            }

            alert(
                data.message ||
                "Unable to reset your password. Please try again."
            );

        } catch (error) {
            console.error("Password reset request failed:", error);

            alert(
                "There was an error processing your request. Please try again later."
            );

        } finally {
            button.disabled = false;
            button.textContent = "Reset Password";
        }
    });
});