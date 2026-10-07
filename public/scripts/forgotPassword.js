$(document).ready(function () {
    $("#forgotPasswordForm").on("submit", function (e) {
        e.preventDefault();

        var form = $(this);
        var emailInput = $("#emailFp");
        var button = $("#fpButton");
        var message = $(".forgot-message");
        var email = $.trim(emailInput.val());

        emailInput.removeClass("is-invalid");

        if (!emailInput[0].checkValidity() || email === "") {
            emailInput.addClass("is-invalid");
            emailInput.trigger("focus");
            return;
        }

        button.prop("disabled", true);
        button.text("Submitting...");
        emailInput.prop("disabled", true);

        $.ajax({
            url: "/forgot-password",
            type: "POST",
            data: {
                email: email
            }
        })
        .done(function () {
            message.prop("hidden", false);
            form.remove();
        })
        .fail(function () {
            alert(
                "There was an error processing your request. Please try again later."
            );
        })
        .always(function () {
            button.prop("disabled", false);
            button.text("Send email");
            emailInput.prop("disabled", false);
        });
    });
});