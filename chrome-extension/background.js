function openWidi() {
  function getSelectionText() {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
  }
  
  function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');
  
    for (let i = 0; i < metas.length; i++) {
      let name = metas[i].getAttribute('name');
      let property = metas[i].getAttribute('property');
      if (
        (name && name.includes(metaName)) || 
        (property && property.includes(metaName))
      ) {
        return metas[i].getAttribute('content');
      }
    }
  
    return '';
  }

  let text = getSelectionText()
  let name = getMeta('title').substring(0,20)
  let username = getMeta('description').substring(0,20)
  console.log('WIDI', text, name, username)

  let url = `https://secure-dusk-50656.herokuapp.com/?text=${text}&name=${name}&username=${username}`
  window.open(url, '_blank').focus();
  
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: openWidi
  });
});