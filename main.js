function navigateTo(section) {
  let navLinks = document.querySelectorAll(".navlink");

  window.location = section;

  navLinks.forEach((link) => {
    let sectionTitle = link.getAttribute("value");

    if (`#${sectionTitle}` === section) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

let headerHeight = 50;

function navLinkUpdate() {
  let navLinks = document.querySelectorAll(".navlink");

  let fromTop = window.scrollY + headerHeight;

  navLinks.forEach((link) => {
    let sectionTitle = link.getAttribute("value");
    let section = document.querySelector(`#${sectionTitle}`);
    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", throttle(navLinkUpdate, 500));
