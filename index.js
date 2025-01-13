var project_uuid = "";
var provider = null;
var model = null;
var max_tokens = 0;
var temperature = 0;
var k = 1;
var historyChat = [];
let title = "";
let message = "";
let color = "";
const url2 = new URL(window.location.href);
let w = window.innerWidth;

function resizeMessagContainer() {}

window.addEventListener("load", (e) => {
  let params = new URL(document.location).searchParams;
  if (params) {
    project_uuid = params.get("project");
    provider = params.get("provider");
    max_tokens = params.get("max_tokens");
    temperature = params.get("temperature");
    getInfoParams(params);
    try {
      k = parseInt(params.get("k")) || 1;
    } catch (err) {
      k = 1;
    }
  }
  const size = document.getElementById("edenai-yoda-conversation");
  if (window.innerWidth > 380) {
    size.style.setProperty("width", "332px");
  } else {
    size.style.width = "80vw";
  }
});

window.addEventListener("resize", (e) => {
  console.log(window.innerWidth);
  const size = document.getElementById("edenai-yoda-conversation");
  if (window.innerWidth > 380) {
    size.style.setProperty("width", "332px");
  } else {
    size.style.width = "85vw";
  }
});

function getInfoParams(params) {
  model = params.get("model");
  image = params.get("image");
  const chatTitle = document.getElementsByClassName("chatTitle");
  const yodaMessage = document.getElementsByClassName(
    "edenai-yoda-chatbot-text edenai-yoda-triangle-left edenai-yoda-left-top",
  );
  const buttonColor = document.getElementById("edenai-yoda-open-close-chatbot");
  if (url2.searchParams.has("title")) {
    title = params.get("title");
    chatTitle[0].innerHTML = title;
  }
  if (url2.searchParams.has("message")) {
    message = params.get("message");
    yodaMessage[0].innerHTML = message;
  }
  if (url2.searchParams.has("color")) {
    color = params.get("color");
    buttonColor.style.setProperty("background-color", color, "important");
  }
}

// Get chatbot elements
const chatbot = document.getElementById("edenai-yoda-chatbot");
const conversation = document.getElementById("edenai-yoda-conversation");
const inputForm = document.getElementById("edenai-yoda-input-form");
const inputField = document.getElementById("edenai-yoda-input-field");
const buttonChatbot = document.getElementById("edenai-yoda-open-close-chatbot");
let chatBotContainer = document.getElementById("edenai-yoda-chatbot-container");
const loaderContainer = document.getElementById("loaderContainer");
const iframe = document.getElementById("edenai-message-iframe-container");

function resizeMessagContainer() {}

window.addEventListener("message", (event) => {
  if (
    event.origin ===
    "https://eden-ai-bb3d63a76cc63c391-b254d9db6f2d6.webflow.io/"
  ) {
    inputField.value = event.data;
  }
});

buttonChatbot.addEventListener("click", function (event) {
  let buttonIcon = document.querySelector(
    "#edenai-yoda-open-close-chatbot > i",
  );
  let data = "hide";
  if (chatBotContainer.classList.contains("visible")) {
    chatBotContainer.classList.remove("visible");
    buttonIcon.className = "fa fa-comment";
  } else {
    chatBotContainer.classList.add("visible");
    buttonIcon.className = "fa fa-window-close";
    data = "show";
  }
  window.parent.postMessage(data, "*");
});

// Add event listener to input form
inputForm.addEventListener("submit", async function (event) {
  // Prevent form submission
  event.preventDefault();

  // Get user input
  const input = inputField.value;

  // Clear input field
  inputField.value = "";
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Add user input to conversation
  let message = document.createElement("div");
  message.setAttribute("sentTime", currentTime);
  message.classList.add(
    "edenai-yoda-chatbot-message",
    "edenai-yoda-user-message",
  );
  message.innerHTML = `<p class="edenai-yoda-chatbot-text edenai-yoda-triangle-right edenai-yoda-right-top">${input}</p>`;
  conversation.appendChild(message);
  message.scrollIntoView({ behavior: "smooth" });

  // Generate chatbot response
  const response = await getYodaResponse(input);

  // Add chatbot response to conversation
  message = document.createElement("div");
  message.setAttribute("sentTime", currentTime);
  message.classList.add("edenai-yoda-chatbot-message", "edenai-yoda-chatbot");
  message.innerHTML = `<div alt="Card image cap" class="edenai-yoda-chat-askllm-bubble edenai-yoda-prompt-answer-llm"> <div alt="Card image cap"
		class="edenai-yoda-icon-chat-llm edenai-yoda-icon-chat-eden"> <img height="50px" width="50px" src="assets/img/icons/logoBot.svg" alt /> </div> </div>
		<p class="edenai-yoda-chatbot-text edenai-yoda-triangle-left edenai-yoda-left-top">${response}</p>`;
  conversation.appendChild(message);
  message.scrollIntoView({ behavior: "smooth" });

  if (response != "Error") {
    historyChat.push({
      user: input,
      assistant: response,
    });
  }
});
function addLoader() {
  const newDiv = document.createElement("div");
  newDiv.classList.add("loader");
  newDiv.setAttribute("id", "loader");
  const currentDiv = document.getElementById("loaderContainer");
  currentDiv.parentNode.insertBefore(newDiv, currentDiv);
}
function redirectToedenIA() {
  window.parent.location.href =
    "https://eden-ai-bb3d63a76cc63c391-b254d9db6f2d6.webflow.io/workflows/askyoda";
}

function redirectToYoda() {
  window.parent.location.href =
    "https://app.edenai.run/user/register?referral=create-chatbot";
}

// Generate chatbot response function
async function getYodaResponse(text) {
  const url = `https://api.edenai.run/v2/aiproducts/askyoda/v2/${project_uuid}/ask_llm_project`;
  const payload = {
    query: text,
    llm_provider: provider,
    llm_model: model,
    history: historyChat,
    k: k,
  };
  // only add max_tokens param if it is set by user
  // if set to null, backend will throw an error
  if (max_tokens) {
    payload.max_tokens = max_tokens;
  }
  
  if (temperature) {
    payload.temperature = temperature;
  }

  addLoader();
  const call = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!call.ok) {
    const loader = document.getElementById("loader");
    loader.remove();
    return "Error";
  }
  const response = await call.json();
  const loader = document.getElementById("loader");
  loader.remove();
  return response.result;
}
