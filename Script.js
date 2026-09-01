// ========================================
// SACHIN — DIGITAL STUDIO
// Main JavaScript
// ========================================


// ----------------------------------------
// MOBILE MENU
// ----------------------------------------

function toggleMenu() {
    const nav = document.getElementById("navlinks");

    if (nav) {
        nav.classList.toggle("open");
    }
}


// Close mobile menu after clicking a link
document.querySelectorAll(".navlinks a").forEach(function(link) {

    link.addEventListener("click", function() {

        const nav = document.getElementById("navlinks");

        if (nav) {
            nav.classList.remove("open");
        }

    });

});


// ----------------------------------------
// CODE STUDIO
// ----------------------------------------

function runCode() {

    const codeEditor = document.getElementById("code");
    const preview = document.getElementById("preview");

    if (!codeEditor || !preview) {
        return;
    }

    const code = codeEditor.value;

    preview.srcdoc = code;
}


// ----------------------------------------
// RUN CODE WITH CTRL + ENTER
// ----------------------------------------

const codeEditor = document.getElementById("code");

if (codeEditor) {

    codeEditor.addEventListener("keydown", function(event) {

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {

            event.preventDefault();

            runCode();

        }

    });

}


// ----------------------------------------
// AUTO PREVIEW
// ----------------------------------------

window.addEventListener("load", function() {

    runCode();

});


// ----------------------------------------
// CONTACT BUTTON
// ----------------------------------------

function copyEmail() {

    const email = "your@email.com";

    if (navigator.clipboard) {

        navigator.clipboard.writeText(email)
            .then(function() {

                alert(
                    "Email copied!\n\n" +
                    "Replace your@email.com with your real email."
                );

            })
            .catch(function() {

                alert("Email: " + email);

            });

    } else {

        alert("Email: " + email);

    }

}


// ----------------------------------------
// SMOOTH SCROLL
// ----------------------------------------

document.querySelectorAll('a[href^="#"]').forEach(function(link) {

    link.addEventListener("click", function(event) {

        const targetId = this.getAttribute("href");

        if (targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


// ----------------------------------------
// SCROLL REVEAL ANIMATION
// ----------------------------------------

const revealElements = document.querySelectorAll(
    ".card, .section-head, .playlist, .studio"
);

const revealObserver = new IntersectionObserver(

    function(entries) {

        entries.forEach(function(entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.12
    }

);


revealElements.forEach(function(element) {

    element.classList.add("reveal");

    revealObserver.observe(element);

});


// ----------------------------------------
// LIVE CODE INDICATOR
// ----------------------------------------

if (codeEditor) {

    codeEditor.addEventListener("input", function() {

        const title = document.querySelector(".studio-title");

        if (title) {

            title.textContent = "SACHIN_CODE_STUDIO • EDITING";

            clearTimeout(window.codeTimer);

            window.codeTimer = setTimeout(function() {

                title.textContent = "SACHIN_CODE_STUDIO";

            }, 1000);

        }

    });

}


// ----------------------------------------
// PREVENT EMPTY CODE
// ----------------------------------------

function checkCode() {

    if (!codeEditor) {
        return;
    }

    if (codeEditor.value.trim() === "") {

        codeEditor.value =
`<!DOCTYPE html>
<html>
<body>

<h1>Hello SACHIN</h1>

<p>Start creating your website.</p>

</body>
</html>`;

    }

}


// ----------------------------------------
// INITIALIZE
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function() {

    checkCode();

    runCode();

});
