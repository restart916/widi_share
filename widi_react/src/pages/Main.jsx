import '../main.css';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'bootstrap';
import { fabric } from 'fabric';
import { logEvent } from "firebase/analytics";
import { analytics } from '../firebase';


const fontList = [
  {
      "name": "Pretendard",
      "family": "Pretendard"
  },
  {
      "name": "리디바탕",
      "family": "RIDIBatang"
  }, 
  {
      "name": "Kopub 바탕체",
      "family": "KoPubWorldBatang"
  }, 
  {
      "name": "본고딕",
      "family": "NotoSans"
  }, 
]

const imageList = [
  {"file": "bg_21","fontColor": '#FFFFFF'},
  {"file": "bg_22","fontColor": '#FFFFFF'},
  {"file": "bg_23","fontColor": '#000000'},
  {"file": "bg_24","fontColor": '#000000'},
  {"file": "bg_25","fontColor": '#000000'},
  {"file": "bg_26","fontColor": '#FFFFFF'},
  {"file": "bg_20","fontColor": '#FFFFFF'},
  {"file": "bg_18","fontColor": '#FFFFFF'},
  // {"file": "bg_19","fontColor": '#FFFFFF'},
  {"file": "bg_17","fontColor": '#FFFFFF'},
  {"file": "bg_16","fontColor": '#000000'},
  {"file": "bg_10", "fontColor": '#FFFFFF'},
  {"file": "bg_9", "fontColor": '#000000'},
  {"file": "bg_13", "fontColor": '#FFFFFF'},
  // {"file": "bg_14","fontColor": '#FFFFFF'},
  {"file": "bg_15","fontColor": '#FFFFFF'},
  {"file": "bg_11", "fontColor": '#FFFFFF'},
  {"file": "bg_12","fontColor": '#FFFFFF'},
  // {"file": "bg_0", "fontColor": '#FFFFFF'},
  // {"file": "bg_1", "fontColor": '#FFFFFF'},
  // {"file": "bg_2", "fontColor": '#FFFFFF'},
  // {"file": "bg_3", "fontColor": '#FFFFFF'},
  {"file": "bg_4", "fontColor": '#FFFFFF'},
  {"file": "bg_5", "fontColor": '#FFFFFF'},
  {"file": "bg_6", "fontColor": '#000000'},
  // {"file": "bg_7", "fontColor": '#FFFFFF'},
  // {"file": "bg_8", "fontColor": '#FFFFFF'},
]

export default function Main() {
  const [imageData, setImageData] = useState('');
  const [selectImage, setSelectImage] = useState(imageList[0].file);
  const [selectFont, setSelectFont] = useState(fontList[0]['family']);
  const [selectColor, setSelectColor] = useState('#FFFFFF');
  const [selectCharSpacing, setSelectCharSpacing] = useState(100);
  const [tweetText, setTweetText] = useState('');
  const [tweetName, setTweetName] = useState('');
  const [tweetUsername, setTweetUsername] = useState('');
  const [canvas, setCanvas] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [customImageWidth, setCustomImageWidth] = useState(100);
  const [customImageHeight, setCustomImageHeight] = useState(100);
  const [timer, setTimer] = useState(null);
  const fileupload = useRef(null);

  useEffect(() => {
    fabric.Object.prototype.objectCaching = true;
  }, []);

  const render = (threshold = 100) => {
    clearTimeout(timer)
    const t = setTimeout(() => {
        setTimer(null)
        redraw()
        showModal()                    
    }, threshold)
    setTimer(t)
  }

  const showModal = () => {
    document.getElementById('modal').style.display='flex'
  }
  const closeModal = () => {
    document.getElementById('modal').style.display='none'
  }
  const doNothing = (event) => {
    event.stopPropagation()
  }

  const redraw = () => {
    // 600 * 0.6 = 360
    // console.log(window.screen.width)
    // const imageSize = Math.min(window.screen.width-32, 600);
    const imageSize = 360;
    const margin = 20 ;

    if (canvas == null) {
        
    } else {
        canvas.dispose()
    }

    const fabricCanvas = new fabric.Canvas('canvas', {
        isDrawingMode: false,
        width: imageSize,
        height: imageSize,
        allowTouchScrolling: false,
    })
    
    setCanvas(fabricCanvas)
    
    if (customImage) {
        // console.log('wow', customImage)
        var imgInstance = new fabric.Image(customImage, {
            left: 0,
            top: 0,
            right: customImageWidth,
            bottom: customImageHeight,
            scaleX: imageSize / customImageWidth,
            scaleY: imageSize / customImageHeight,
            opacity: 1,
            selectable: false,
        });
        fabricCanvas.add(imgInstance);
    } else {
        let imgElement = document.getElementById(selectImage);
        let imgInstance = new fabric.Image(imgElement, {
            left: 0,
            top: 0,
            right: 1200,
            bottom: 1200,
            scaleX: imageSize / 1200,
            scaleY: imageSize / 1200,
            opacity: 1,
            selectable: false,
        });
        fabricCanvas.add(imgInstance);
    }

    let text = new fabric.Textbox(tweetText, { 
        left: margin,
        width: imageSize - (margin * 2) - 8,
        fontSize: 15, 
        fontFamily: selectFont,
        lineHeight: 1.5,
        selectable: false,
        fill: selectColor,
        textAlign: 'left',
        charSpacing: selectCharSpacing,
        splitByGrapheme: true,
    });

    // console.log('height', text.height);
    text.top = (imageSize - (text.height + 54)) / 2
    fabricCanvas.add(text);

    let nameText = new fabric.Text(tweetName, { 
        left: margin,
        width: imageSize - (margin * 2),
        fontSize: 14, 
        fontFamily: 'NotoSans',
        top: (text.top + text.height + 16),
        selectable: false,
        fill: selectColor,
    });
    fabricCanvas.add(nameText);

    if (tweetUsername) {
        let usernameText = new fabric.Text(`${tweetUsername}`, { 
            left: margin,
            width: imageSize - (margin * 2),
            fontSize: 14, 
            fontFamily: 'NotoSansThin',
            top: (text.top + text.height + 38),
            selectable: false,
            fill: `${selectColor}B0`,
        });
        // console.log('usernameText.height', usernameText.height)
        fabricCanvas.add(usernameText);
    }

    const logoScale = 0.3
    let logoElement = document.getElementById('logo');
    let logoInstance = new fabric.Image(logoElement, {
        left: imageSize - (150 * logoScale) - 10,
        top: imageSize - (60 * logoScale) - 10,
        scaleX: logoScale,
        scaleY: logoScale,
        opacity: 1,
        selectable: false,
    });
    fabricCanvas.add(logoInstance);

    setImageData(fabricCanvas.toDataURL({
        format: 'png',
        multiplier: 4,
    }))

    // this.errorMessage = ''
    // this.loadingMessage = ''
    // this.resultMessage = '아래 이미지를 꾸욱 눌러 <strong>저장</strong>해 주세요'
    
    console.log('finished render')
  }

  const checkSelected = (image) => {
    return image.file === selectImage ? 'selected' : 'no-selected'
  }
  const checkSelectedFont = (font) => {
    return font === selectFont ? 'selected-font' : ''
  }

  const onClickCreateImage = () => {
    logEvent(analytics, 'create_image');
    render()
  }

  const onClickImage = async (image) => {
    logEvent(analytics, 'select_image', {image});
    
    setSelectImage(image.file)
    setSelectColor(image.fontColor)

    fileupload.current.value = null;
    setCustomImage(null)
    
  }

  const onClickFont = async (family) => {
    setSelectFont(family);
    logEvent(analytics, 'select_font', {family});
  }
  const onClickColor = async (color) => {
    setSelectColor(color);
    logEvent(analytics, 'select_color', {color});
  }

  const moveHome = () => {
    window.location.href="https://share.wimouniv.com/";
  }
  const openDuetTodo = () => {
    window.open('https://apps.apple.com/kr/app/%EB%93%80%EC%97%A3%ED%88%AC%EB%91%90/id6445875698', '_blank');
  }
  const sendCopyLog = () => {
    logEvent(analytics, 'copy_image');
  }

  const changeImageInput = (e) => {
    console.log('changeImageInput', e.target.files[0])
    let file = e.target.files[0]
    
    var reader = new FileReader();
    reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            setCustomImage(imgObj)
            setCustomImageHeight(imgObj.height)
            setCustomImageWidth(imgObj.width)
        }
    };
    reader.readAsDataURL(file);
  }

  const shareImage = async () => {
    let share_url = 'https://share.wimouniv.com/'
    
    const newText = '위모에서 만들기'

    let dataURL = imageData;
    let byteString = atob(dataURL.split(',')[1]);
    let mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {type: mimeString});
    let file = new File([blob], 'image.png', {type: mimeString});

    const shareData = {
        title: newText,
        text: newText,
        url: share_url,
        files: [file],
    }

    if (navigator.share) {
        await navigator.share(shareData)
    } else {
        if (navigator.clipboard) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/plain": new Blob([`${newText} ${share_url}`], {type: "text/plain"}),
                    [mimeString]: blob
                })
            ]);
        
            // show toast
            var toastElList = [].slice.call(document.querySelectorAll('.toast'))
            var toastList = toastElList.map(function (toastEl) {
              return new Toast(toastEl, {autohide: true, delay: 3000})
            });
            toastList.forEach(toast => toast.show()); // This will show all toasts
        } else {
            console.log('navigator.clipboard is not supported')
            // this.errorMessage = '공유하기 기능을 지원하지 않는 브라우저입니다.'
        }
    }
  }
  const saveImage = async () => {
    let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        // Open the image in a new window for iOS
        window.open(imageData);
    } else {
        let a = document.createElement('a');
        a.href = imageData;
        a.download = 'image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  }

  return (
    <>
      <div id="app">
        {/* <ins class="kakao_ad_area" style="display:none;" 
            data-ad-unit    = "DAN-sprUUbzsH1FNCx00" 
            data-ad-width   = "320" 
            data-ad-height  = "50"></ins>  */}
            
        <div className="header">
          <div id='productName'>
            <img src="./image/header_round.svg" onClick={moveHome} />
          </div>
        </div>

        <div className="body-content">
            <div id='detailInput'>
                <p style={{marginTop: '0px', fontWeight: '700'}}>이미지로 만들고 싶은 <br />내용을 써주세요</p>
                <textarea 
                  type="text" 
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="내용을 넣어주세요"
                  style={{resize: 'none', height: '200px', marginBottom: '12px', marginTop: '20px'}}
                  className="inputTweetName">
                {/* @keyup="render"
                  @change="render"
                  @input="render"
                  @paste="render" */}
                </textarea>
                <input 
                    type="text" 
                    value={tweetName}
                    onChange={(e) => setTweetName(e.target.value)}
                    placeholder="제목"
                    className="inputTweetName">
                </input>
                <input 
                    type="text" 
                    value={tweetUsername}
                    onChange={(e) => setTweetUsername(e.target.value)}
                    placeholder="글쓴이"
                    className="inputTweetName">
                </input>
            </div>

            <div id='selectImage' className="container ps-0 pe-0">
                {/* imageList for loop */}
                { imageList.map((image, index) => {
                  return (
                    <div className="item" key={index}>
                      <div onClick={() => onClickImage(image)}>
                        <img id={image.file} src={'./image/' + image.file + '.png'} className={checkSelected(image)} />
                      </div>
                    </div>
                  )})
                }
            </div>

            <input 
                type="file" 
                ref={fileupload}
                onChange={changeImageInput}
                style={{marginTop: '16px'}}
                >
            </input>

            <div id='selectFont' className='container ps-0 pe-0' style={{marginTop: '24px'}}>
              { fontList.map((font, index) => {
                return (
                  <div className="item-button" key={index}>
                    <div className={`fontButton ${checkSelectedFont(font.family)}`} onClick={() => onClickFont(font.family)} >
                      {font.name}
                    </div>
                  </div>
                )
              })}
            </div>
    
            <div id='selectColor' className="container ps-0 pe-0" style={{marginTop: '20px'}}>
                <div className="item-button" style={{marginRight: '8px'}}>
                    <div className="colorButtonWhite" onClick={() => onClickColor('#FFFFFF')}>
                        하얀색 글씨
                    </div>
                </div>
                <div className="item-button">
                    <div className="colorButtonBlack" onClick={() => onClickColor('#1C1C1E')}>
                        검정색 글씨
                    </div>
                </div>
            </div>

            <div id='selectCharSpacing' className="container ps-0 pe-0" style={{marginBottom: '20px', marginTop: '24px'}}>
                <div className="item-button" style={{height: '40px', marginLeft: '8px'}}>
                    <div style={{display: 'flex', height: '40px', alignItems: 'center', fontSize: '14px'}}>
                        자간
                    </div>
                </div>
                <div className="item-button"style={{marginRight: '8px'}}>
                    <div style={{padding: '0px 8px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <input type="range" min="0" max="1000" step="10" className="slider" id="myRange" 
                          style={{width: '200px', height: '100%', outline: 'none'}}
                          value={selectCharSpacing}
                          onChange={(e) => setSelectCharSpacing(e.target.value)}
                        />
                    </div>
                </div>
            </div>
          </div>

          <div>
            <div onClick={openDuetTodo} 
              style={{background: 'black', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div 
                  style={{display: 'flex'}}>
                    <div>
                        <img src="./image/banner_image.png" 
                          style={{width: '40px'}} />
                    </div> 
                    <div style={{marginLeft: '12px'}}>
                    <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold'}}>
                            듀엣투두
                        </div> 
                        <div 
                          style={{color: 'white', opacity: '50%', fontSize: '14px'}}>
                            오타쿠용 할일 관리 앱
                        </div>
                    </div> 
                </div>
                <div 
                  style={{backgroundColor: '#2F7CF6', padding: '4px 18px', borderRadius: '100px'}}>
                    <div 
                      style={{fontSize: '12px', fontWeight: 'normal', color: 'white'}}>
                        받기
                    </div>
                </div>
            </div>
        </div>
        {/* https://apps.apple.com/kr/app/%EB%93%80%EC%97%A3%ED%88%AC%EB%91%90/id6445875698 */}    

        <div id="credit">
            <div className="credit-text">
                서비스
            </div>
            <div className="credit-link">
                <a href="https://twitter.com/widishare2021" className="credit" target="_blank">버그 신고 및 제휴 문의</a>
            </div>
            <div style={{marginBottom: '16px'}}>
            </div>
            <div className="credit-text">
                만든 사람
            </div>
            <div className="credit-link">
                <a href="https://twitter.com/FlatcherLynd" className="credit" target="_blank">윌리 👀</a>
            </div>
        </div>

        <div style={{display: 'none'}}>
            <canvas id="canvas" ></canvas>
            <img id="logo" src="./image/logo.png"/>
        </div>

        <div className="float-bottom">
            <div className="createButton" onClick={onClickCreateImage}>
                이미지 만들기
            </div>
        </div>

        <div className="modal" id="modal" onClick={closeModal}>
            <div className="modal-content" onClick={doNothing}>
                <div>
                    <img className="closeButton" onClick={closeModal} src="./image/button_close.svg" />
                </div>
                <div className="">
                    <p className="modal-emoji">🎉</p>
                    <p className="modal-text">짠! 이미지가 만들어졌어요</p>
                    <div id='result'>
                      {imageData != '' && <img src={imageData} onCopy={sendCopyLog} />}
                    </div>
                </div>
                <div className="modal-bottom">
                    <div className="modal-button share-button" onClick={shareImage}>
                        공유하기
                    </div>
                    <div className="modal-button save-button" onClick={saveImage}>
                        이미지 저장
                    </div>
                </div>
            </div>
            {/* <div className="lottie-div">
                <lottie-player className="lottie-player" src="./image/lottie_ani.json" background="transparent" speed="1" ></lottie-player>
            </div> */}

            <div className="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-body z-toast">
                    이미지가 복사되었어요
                </div>
            </div>
        </div>
      </div>
    </>
  );
}