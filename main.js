// Wait for DOM content to load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Main dashboard loaded!");

  // 1. Logout Functionality
  const logoutButton = document.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Redirect to the welcome page
      window.location.href = "welcome.html";
    });
  }

  // 2. Navigation Highlight
  const navbarLinks = document.querySelectorAll(".navbar a");
  navbarLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      navbarLinks.forEach((nav) => nav.classList.remove("active"));
      event.target.classList.add("active");
    });
  });

  // 3. Vendor Performance Chart
  const vendorChart = document.getElementById("vendorPerformanceChart");
  if (vendorChart) {
    const ctx = vendorChart.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Vendor A", "Vendor B", "Vendor C", "Vendor D"],
        datasets: [
          {
            label: "Performance",
            data: [85, 90, 78, 88],
            backgroundColor: ["#5cb8ff", "#3498db", "#ff6b6b", "#f1c40f"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  // 4. Button Clicks for Widgets
  const buttons = document.querySelectorAll(".widget button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      alert(`Feature for ${button.textContent} coming soon!`);
    });
  });

  // 5. Dynamic Updates Example
  setTimeout(() => {
    const budgetWidget = document.querySelector(
      ".widget h3:contains('Budget Overview')"
    );
    if (budgetWidget) {
      const budgetParagraph = budgetWidget.nextElementSibling;
      budgetParagraph.textContent = "Updated Budget: $550,000"; // Dummy Update
    }
  }, 5000); // Update after 5 seconds
});
