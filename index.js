var project_uuid = ""
var provider= null
var model=null
var k=1
var historyChat = [];


window.addEventListener("load", () => {
  let params = (new URL(document.location)).searchParams;
  if (params) {
    project_uuid = params.get('project');
    provider = params.get('provider');
    model = params.get('model');
    try {
      k = parseInt(params.get('k')) || 1;
    } catch(e) {
      k = 1
    }
  }
  }
)


// Get chatbot elements
const chatbot = document.getElementById('edenai-yoda-chatbot');
const conversation = document.getElementById('edenai-yoda-conversation');
const inputForm = document.getElementById('edenai-yoda-input-form');
const inputField = document.getElementById('edenai-yoda-input-field');
const buttonChatbot = document.getElementById('edenai-yoda-open-close-chatbot')
let chatBotContainer = document.getElementById('edenai-yoda-chatbot-container')
const loaderContainer = document.getElementById("loaderContainer")

buttonChatbot.addEventListener('click', function(event) {
	let buttonIcon = document.querySelector('#edenai-yoda-open-close-chatbot > i');
	let data = "hide"
	if (chatBotContainer.classList.contains('visible')) {
		chatBotContainer.classList.remove('visible');
		buttonIcon.className = "fa fa-comment"
	} else {
		chatBotContainer.classList.add('visible');
		buttonIcon.className = "fa fa-window-close"
		data = "show"
	}
	window.parent.postMessage(data, "*");
});

// Add event listener to input form
inputForm.addEventListener('submit', async function(event) {
  // Prevent form submission
  event.preventDefault();

  // Get user input
  const input = inputField.value;

  // Clear input field
  inputField.value = '';
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" });

  // Add user input to conversation
  let message = document.createElement('div');
	message.setAttribute('sentTime', currentTime)
  message.classList.add('edenai-yoda-chatbot-message', 'edenai-yoda-user-message');
  message.innerHTML = `<p class="edenai-yoda-chatbot-text edenai-yoda-triangle-right edenai-yoda-right-top">${input}</p>`;
  conversation.appendChild(message);
  message.scrollIntoView({behavior: "smooth"});

  // Generate chatbot response
	const response = await getYodaResponse(input);

  // Add chatbot response to conversation
  message = document.createElement('div');
	message.setAttribute('sentTime', currentTime)
  message.classList.add('edenai-yoda-chatbot-message','edenai-yoda-chatbot');
	message.innerHTML = `<div alt="Card image cap" class="edenai-yoda-chat-askllm-bubble edenai-yoda-prompt-answer-llm"> <div alt="Card image cap"
		class="edenai-yoda-icon-chat-llm edenai-yoda-icon-chat-eden"> <img height="30px" width="30px" src="assets/img/icons/EdenColors.svg" alt
		style="filter: brightness(0) invert(1)" /> </div> </div>
		<p class="edenai-yoda-chatbot-text edenai-yoda-triangle-left edenai-yoda-left-top">${response}</p>`
  conversation.appendChild(message);
  message.scrollIntoView({behavior: "smooth"});

  if (response != "Error") {
    historyChat.push({
      user: input,
      assistant: response
    })
  } 
});
  function addLoader(){
    const newDiv = document.createElement("div")
    newDiv.classList.add("loader")
    newDiv.setAttribute("id", "loader")
    const currentDiv = document.getElementById("loaderContainer");
    currentDiv.parentNode.insertBefore(newDiv,currentDiv) 
    console.log("create div")
  }

// Generate chatbot response function
async function getYodaResponse(text) {
	url = `https://api.edenai.run/v2/aiproducts/askyoda/e40459d3-7d28-454d-ad44-cb3e30764ecf/ask_llm_project`
	payload = {
		"query": text,
    "llm_provider": provider,
    "llm_model": model,
    "history": historyChat,
    "k": k
	}
  addLoader()
  call = await fetch(url, { method : "POST", body: JSON.stringify(payload), headers : {"Content-Type": "application/json"} })
	if (!call.ok) {
    const loader = document.getElementById("loader")
    loader.remove()
    return "Error"
  }
  response = await call.json()
  const loader = document.getElementById("loader")
  loader.remove()
  return response.result;
 }