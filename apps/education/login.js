"use strict";

document.querySelector("#access-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  const error = document.querySelector("#login-error");
  button.disabled = true;
  button.textContent = "Verifying…";
  error.textContent = "";
  try {
    const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: document.querySelector("#passcode").value }) });
    const result = response.status === 204 ? {} : await response.json();
    if (!response.ok) throw new Error(result.error || "Access denied");
    location.replace("/");
  } catch (failure) {
    error.textContent = failure.message;
    document.querySelector("#passcode").select();
  } finally {
    button.disabled = false;
    button.textContent = "Access platform";
  }
});
