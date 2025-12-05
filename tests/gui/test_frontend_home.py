import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def test_frontend_shows_auth_page(browser):
    browser.get("http://localhost:5173/")
    heading = WebDriverWait(browser, 15).until(
        EC.visibility_of_element_located((By.TAG_NAME, "h1"))
    )
    assert "Teacher Booking" in heading.text
