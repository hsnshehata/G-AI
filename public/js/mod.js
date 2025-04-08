function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-section');
  tabs.forEach(tab => {
    tab.style.display = 'none';
  });

  const modTab = document.getElementById(tabId);
  if (modTab) {
    modTab.style.display = 'block';
  } else {
    console.error(`Tab with ID ${tabId} not found`);
  }
}
