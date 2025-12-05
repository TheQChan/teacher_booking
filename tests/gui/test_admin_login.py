import pytest
from django.contrib.auth.models import User
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys


@pytest.mark.django_db
def test_admin_login(browser, live_server):
    username = "gui_admin"
    password = "GuiStrongPass123!"
    User.objects.create_superuser(username=username, email="gui@example.com", password=password)

    browser.get(f"{live_server.url}/admin/login/")
    username_input = browser.find_element(By.NAME, "username")
    password_input = browser.find_element(By.NAME, "password")
    username_input.send_keys(username)
    password_input.send_keys(password + Keys.ENTER)

    assert "Site administration" in browser.title
    assert "Log out" in browser.page_source
