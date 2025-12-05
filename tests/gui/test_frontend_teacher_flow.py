import string
from datetime import timedelta
from random import choices

import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def _random_username():
    prefix = ''.join(choices(string.ascii_lowercase, k=6))
    return f"selenium_teacher_{prefix}"


@pytest.mark.django_db
def test_frontend_teacher_flow(browser):
    username = _random_username()
    password = "TeacherPass123!"
    email = f"{username}@example.com"

    browser.get("http://localhost:5173/")

    register_toggle = WebDriverWait(browser, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Регистрация')]"))
    )
    register_toggle.click()

    WebDriverWait(browser, 10).until(
        EC.visibility_of_element_located((By.NAME, "first_name"))
    )

    role_button = browser.find_element(By.XPATH, "//button[contains(., 'Преподаватель')]")
    role_button.click()

    browser.find_element(By.NAME, "first_name").send_keys("Selenium")
    browser.find_element(By.NAME, "last_name").send_keys("Teacher")
    browser.find_element(By.NAME, "username").send_keys(username)
    browser.find_element(By.NAME, "email").send_keys(email)
    browser.find_element(By.NAME, "phone_number").send_keys("+79990000000")
    browser.find_element(By.NAME, "password").send_keys(password)
    browser.find_element(By.NAME, "password_confirm").send_keys(password)
    browser.find_element(By.NAME, "password_confirm").send_keys(Keys.TAB)  # ensure blur

    submit = browser.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit.click()

    WebDriverWait(browser, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Сессии')]"))
    )

    teacher = User.objects.get(username=username)
    browser.refresh()

    create_button = WebDriverWait(browser, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Создать слот')]"))
    )
    create_button.click()

    quick_time = WebDriverWait(browser, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='9:00-10:00']"))
    )
    quick_time.click()

    form_submit = browser.find_element(By.CSS_SELECTOR, "form button[type='submit']")
    form_submit.click()

    teacher_text = f"Преподаватель ID: {teacher.id}"
    WebDriverWait(browser, 30).until(
        EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(), '{teacher_text}')]"))
    )
