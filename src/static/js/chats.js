const reduceText = text => text.length > 25?text.slice(0, 24)+"...":text

const updateRealtimeChat = data => {
  /*
  Update chats position and add new chat

  data: chat content
  */

  let targetUserData = (userData.email === data.messages.to_email.email)?data.messages.from_email.email:data.messages.to_email.email;
  let chatExists = false
  
  chatEmailFormated = targetUserData.replace('@gmail.com', '')
  chatExists = friends.includes(targetUserData)?true:false

  if (chatExists) {
    let chat = document.querySelector(`div#${chatEmailFormated}.message`)
    chat.querySelector('p').textContent = reduceText(data.messages["content"])
    chat.querySelector('#date').textContent = calculateDateDifference(data.messages["created_at"])

    if (userSelected === data.messages.from_email.email) {
      fetch("/read_messages", {
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify({
          "users": [data.messages.from_email.email, data.messages.to_email.email]
        })
      }) .catch((e) => {
        console.error(e)
      })
    } else if (data.messages.was_readed === false && data.messages.from_email.email !== userData.email && userSelected !== data.messages.to_email.email) {
      if (!chat.querySelector('#counter')) {
        let counter = document.createElement('span');
        counter.id = "counter";
        chat.appendChild(counter);
        chat.querySelector('#counter').textContent = "";
      }

      if (data.messages.to_email.email === userData.email) {
        if (chat.querySelector('#counter').textContent !== "") {
          chat.querySelector('#counter').textContent = parseInt(chat.querySelector('#counter').textContent) + 1;
        } else {
          chat.querySelector('#counter').textContent = 1;
        }
      }
    }

    messageContainer.insertBefore(chat, messageContainer.firstChild)
  } else { messageContainer.insertBefore(createChat(data), messageContainer.firstChild) }
}

const createChat = chat => {
  /*
  Add new chat

  data: chat content
  */
  let targetUserData = (userData.email === chat.users[0].email)?chat.users[1]:chat.users[0];
  let unreadedChatCount = 0;

  const div = document.createElement("div");
  const img = document.createElement("img");
  const contentDiv = document.createElement("div");
  const innerDiv = document.createElement("div");
  const userNameSpan = document.createElement("span");
  const dateSpan = document.createElement("span");
  const messageParagraph = document.createElement("p");
  const counterSpan = document.createElement("span");

  div.className = "message";

  div.id = targetUserData.email.replace("@gmail.com", "");
  div.onclick = messagesClick

  div.dataset.name = targetUserData.name;
  div.dataset.email = targetUserData.email;
  div.dataset.photoURL = targetUserData.photoURL;
  div.dataset.last_stay = targetUserData.last_stay;

  img.src = targetUserData.photoURL;
  img.id = "user-photo";

  contentDiv.id = "content";

  userNameSpan.id = "user-name";
  userNameSpan.textContent = targetUserData.name;

  dateSpan.id = "date";
  dateSpan.textContent = calculateDateDifference(chat.messages["created_at"])
  
  innerDiv.appendChild(userNameSpan);
  innerDiv.appendChild(dateSpan);

  contentDiv.appendChild(innerDiv);
  contentDiv.appendChild(messageParagraph);

  counterSpan.id = "counter";

  try {
    for (ct of chat.messages) {
      if (ct.was_readed === false && ct.from_email !== userData.email) {
        unreadedChatCount += 1;
      }
    }
  } catch {
    if (chat.messages.from_email.email !== userData.email)  unreadedChatCount = 1;
  }

  counterSpan.textContent = unreadedChatCount;

  if (unreadedChatCount !== 0) {
    div.appendChild(counterSpan);
    messageParagraph.textContent = reduceText(chat.messages.content);
  } else {
    messageParagraph.innerHTML = `<strong>${reduceText(chat.messages.content)}</strong>`;
  }
  
  div.appendChild(img);
  div.appendChild(contentDiv);

  return div
}

const updateChats = user => {
  /*
  Fez um requisição para o servidor para ir buscar todos os chats do usuário
  
  user: Objecto user do firebase;

  Obs: Essa função é apenas é executada uma vez.
  */
  friends = [] // Lista de amigos do usuário logado

  fetch(`/chats/${user.email}`)
  .then(data => data.json())
  .then(chats => {
    chats.forEach(chat => {
      let div = document.createElement("div");
      let img = document.createElement("img");
      let contentDiv = document.createElement("div");
      let innerDiv = document.createElement("div");
      let userNameSpan = document.createElement("span");
      let dateSpan = document.createElement("span");
      let counterSpan = document.createElement("span");
      let messageParagraph = document.createElement("p");
      
      let unreadedChatCount = 0;

      div.id = chat.user.email.replace("@gmail.com", "");
      div.className = "message";

      div.onclick = messagesClick

      div.dataset.name = chat.user.name;
      div.dataset.email = chat.user.email;
      div.dataset.photoURL = chat.user.photoURL;
      div.dataset.last_stay = chat.user.last_stay;

      chatsCached[div.dataset.email] = {
        "user": chat.user,
        "messages": chat.messages
      }

      messagesCached[div.dataset.email] = chat.messages
      friends.push(chat.user.email)

      img.src = chat.user.photoURL;
      img.id = "user-photo";

      contentDiv.id = "content";

      userNameSpan.id = "user-name";
      userNameSpan.textContent = chat.user.name;

      dateSpan.id = "date";
      dateSpan.textContent = calculateDateDifference(chat.messages[chat.messages.length - 1]["created_at"]);
      
      innerDiv.appendChild(userNameSpan);
      innerDiv.appendChild(dateSpan);

      messageParagraph.textContent = reduceText(chat.messages[chat.messages.length - 1].content);

      contentDiv.appendChild(innerDiv);
      contentDiv.appendChild(messageParagraph);

      counterSpan.id = "counter";

      for (ct of chat.messages) {
        if (ct.was_readed === false && ct.from_email !== userData.email) {
          unreadedChatCount += 1;
        }
      }

      counterSpan.textContent = unreadedChatCount;

      div.appendChild(img);
      div.appendChild(contentDiv);

      if (unreadedChatCount !== 0) div.appendChild(counterSpan);
      
      messageContainer.appendChild(div);
    })
  })
} 