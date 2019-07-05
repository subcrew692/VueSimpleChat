<template>
<b-container class="col-md-5" style="font-family: courier new;">
  <!-- Modal message -->
  <loading loader="bars" 
      :active.sync="isLoading" 
      :can-cancel="true" 
      :is-full-page="false"></loading>
    <b-card :img-src="userPic" img-width="70" img-height="70" img-alt="Card image" img-right class="cardWithoutBorder mb-3">
      <b-card-text class="text-left">Welcome to {{groupName}}! {{userName}}</b-card-text>
    </b-card>
    <!-- Room Head -->
    <b-card class="roomHeadView">
        <b-media>
        <b-img slot="aside" alt="placeholder" v-if="groupImage !== ''"
        :src="groupImage" 
        width="50" height="50"></b-img>

        <h5 class="mt-0" slot="aside">{{groupName}}</h5>
        <div style="text-align:right">
            <b-dropdown id="dropdown-right" right text="Setting" variant="primary" class="m-2">
                <b-dropdown-item href="#" @click="viewHeadPicture();isChangeHeadPic=true">大頭貼檢視/更新</b-dropdown-item>
                <b-dropdown-item href="#" @click="modifyGroupModal=true;">編輯群組</b-dropdown-item>
                <b-dropdown-item href="#" @click="logOut()">登出</b-dropdown-item>
            </b-dropdown>
        </div>
        </b-media>
    </b-card>

    <!-- Room Body -->
    <b-card id="js-roomBody" class="roomBodyView">
        <!-- 註解：使用template來當迴圈容器，或是判斷用的容器，當條件達成時產出template內容 -->
        <template v-for="item in messages">
            <!-- other people -->
            <template v-if="item.userName != userName">
                <b-media-aside>
                  <b-img slot="aside" class="messageBox__user mt-3"
                  :src="item.headPicture === null ? otherUserPic : item.headPicture"
                  @click="viewOtherUser(item)"></b-img>
                  <div class="messageBox__content">
                      <div class="messageBox__name">{{item.userName}}</div>
                      <div v-if="item.type == 'text'" class="messageBox__message">
                          <div class="messageBox__text">{{item.message}}</div>
                      </div>
                      <div v-if="item.type == 'image'" class="messageBox__image"
                      @click="clickImageMessage(item.id);isChangeHeadPic=false;"><img :src="item.message"></div>
                          <div class="messageBox__delete">
                      </div>
                  </div>
                  <div class="messageBox__time">{{item.timeStamp}}</div>
                </b-media-aside>
            </template>

            <!-- 區塊：self -->
            <template v-if="item.userName == userName">
                <div class="messageBox messageBox--self" :key="item.id"
                @mouseenter="hoverMessageId = item.id"
                @mouseleave="hoverMessageId = null">
                    <div class="messageBox__time">{{item.timeStamp}}</div>
                    <div class="messageBox__content">
                        <div v-if="item.type == 'text'" class="messageBox__message"
                        @click="currentMsgID = currentMsgID === item.id ? '' : item.id">
                            <div class="messageBox__text" :id="item.id">{{item.message}}</div>
                        </div>
                        <div v-if="item.type == 'image'" class="messageBox__image"
                        @click="clickImageMessage(item.id);isChangeHeadPic=false;"><img :src="item.message"></div>
                    </div>
                    <div class="messageBox__delete">
                        <span @click="deleteMessage(hoverMessageId)"
                        v-show="currentMsgID === item.id" >刪除</span>
                    </div>
                </div>
            </template>
        </template>
        <!-- 區塊：上傳進度條 -->
        <div v-show="upload" class="messageBox messageBox--self">
          <div class="messageBox__progress">
            <div id="js-progressBar" class="messageBox__progress--state"></div>
            <div class="messageBox__progress--number">{{progress}}</div>
          </div>
        </div>
    </b-card>

    <!-- Room Bottom -->
    <b-card class="roomBottom">
        <b-card-header class="disablePadding">
          <!-- 上傳圖片 -->
          <div class="roomBottom__tools_upload">
          <label for="file-upload" class="file-upload-style" title="選擇檔案">
            <i class="fa fa-paperclip"></i>
          </label>
          <input type="file" id="file-upload" accept="image/*" @change="sendImage($event, true)" />
          </div>
        </b-card-header>
        <div class="roomBottom__input">
          <!-- 若要再帶入原生js的event(e)到function中，必須使用$event當參數傳入 -->
          <textarea id="js-message" class="roomBottom__input__textarea"
          :class="{disable: !userName}" @keydown.enter="sendMessage($event)"></textarea>
        </div>
    </b-card>
    <!-- 檢視圖片 -->
    <b-modal v-model="viewModal" :title="viewImageTitle" size="lg">
      <template slot="default">
        <img :src="viewImage" style="max-width:750px;">
      </template>
      <template slot="modal-footer" slot-scope="{ ok }">
        <input type="file" id="headPicInput" accept="image/*" @change="sendImage($event, false)">
        <b-button size="sm" variant="success" @click="changeHeadPic()" v-if="isChangeHeadPic">更換</b-button>
        <b-button size="sm" :href="viewImage" download="vueSimpleChatDownload">下載</b-button>
        <b-button size="sm" variant="primary" @click="ok()">OK</b-button>
      </template>
    </b-modal>
    <!-- Other user modal -->
    <b-modal v-model="viewOtherUserModal" :title="viewOtherUserModalTitle" hide-footer>
      <img :src="viewOtherUserHeadPicture" class="view-other-user-picture">
    </b-modal>
    
    <!-- Modify group name-->
    <b-modal v-model="modifyGroupModal" title="編輯群組">
      <span style="color:red;">{{modifyGroupNameMsg}}</span>
      <b-input-group prepend="名稱" class="mt-3">
        <b-form-input type="text" v-model="modifyGroupName"></b-form-input>
        <!--
        <b-input-group-append>
          <b-button variant="primary">確認修改</b-button>
        </b-input-group-append>
        -->
      </b-input-group>

      <b-input-group class="mt-3">
        <!-- Styled -->
        <b-form-file
          v-model="modifyGroupImage"
          :state="Boolean(modifyGroupImage)"
          placeholder="請點擊上傳圖片..."
          drop-placeholder="將圖片拉至此處..."
          accept="image/*"
          browse-text="瀏覽"
          @change="uploadGroupImage($event)"
        ></b-form-file>
      </b-input-group>
      <hr>
      <img :src="previewGroupImageSrc" style="max-width:400px;" />

      <template slot="modal-footer" slot-scope="{ ok }">
        <b-button size="sm" @click="ok()">取消</b-button>
        <b-button size="sm" variant="primary" @click="confirmGroupNameModify()">確認</b-button>
      </template>
    </b-modal>

</b-container>
</template>

<script>
// msgRef = firebase中的資料表/messages/，若沒有的會自動建立
const msgRef = firebase.database().ref('/messages/');
const userRef = firebase.storage().ref('/users/');
const userFileRef = firebase.database().ref('/userProfile/');
const storageRef = firebase.storage().ref('/images/');
const groupRef = firebase.database().ref('/groupInfo/');
const groupImgRef = firebase.storage().ref('/groupImages/');
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  // 指定使用此頁的name
  name: 'ChatRoom',
  components: {
    loading: VueLoading
  },
  data() {
    return {
      hoverMessageId: null,
      groupName: '',
      groupImage: '',
      userName: '', // 名稱
      messages: [], // 訊息內容
      upload: false, // 上傳進度框
      progress: '', // 上傳進度%數
      currentMsgID: '',
      isLoading: false,
      isChangeHeadPic: false, // 是否為大頭貼檢視，控制"更換"button
      userList: null,
      userPic: '',
      viewModal: false, // 檢視Modal
      viewImage: '', // 欲檢視的圖片
      viewImageTitle: '', // 欲檢視圖片的標題
      otherUserPic: 'https://github.com/subcrew692/VueSimpleChat/blob/master/src/assets/user.png?raw=true',
      selectOtherUser: '',    // 是否點選其他User，若是，則塞入ID以便查詢大頭貼
      firstOpen: true, // 確認是否為第一次開啟，若為第一次開啟則將聊天拉至最底部(為了避免每點一次訊息就被拉到最底部)
      viewOtherUserModal: false, // Other user modal
      viewOtherUserModalTitle: '', // Other user modal title
      viewOtherUserHeadPicture: '', // Other user modal head picture
      modifyGroupModal: false, // Modify group modal
      modifyGroupName: '',
      modifyGroupNameMsg: '',
      modifyGroupImage: null, // 上傳群組圖片input
      previewGroupImageSrc: '', // 預覽群組圖片src
      tempImage: null // 暫存上傳的群組圖片
    }
  },
  methods: {
    /** 儲存設定名稱 */
    saveName(cookieName) {
      const vm = this;
      let userName = '';
      if(cookieName !== null) {
        userName = cookieName;
      }else {
        console.log('bad bad');
        this.$router.push('/');
      }
      vm.userName = userName;
      vm.getUserHeadPicture();
    },
    /** 取得user大頭貼 */
    getUserHeadPicture() {
      const vm = this;
      const userName = vm.userName;
      // 尋找此user的大頭貼照片
      userFileRef.on('value', function(snapshot) {
        const val = snapshot.val();
        if(val !== null && val !== undefined) {
          vm.userList = val;
        }
      });
      var tempName = '';
      var hasPic = false;
      if(vm.userList != null) {
        for(var i in vm.userList) {
          if(userName === i) {
            console.log('this user has picture');
            const detail = vm.userList[i];
            for(var j in detail) {
              if(tempName < j) {
                tempName = j;
                vm.userPic = detail[j].pictureURL;
                hasPic = true;
              }
            }
            break;
          }
        }
      }
      vm.userPic = hasPic ? vm.userPic : vm.otherUserPic;
    },
    /** 取得時間 */
    getTime() {
      const now = new Date();
      const hours = now.getHours();
      const isMorning = hours >= 12 ? false : true;
      const minutes = now.getMinutes();
      const format = (hours >= 12) ? "下午" : "上午";
      return `${(hours >= 12) ? "下午" : "上午"} ${hours}:${(minutes < 10) ? '0' + minutes : minutes}`;
    },
    /** 傳送訊息 */
    sendMessage(e) {
      const vm = this;
      const userName = vm.userName;
      let message = document.querySelector('#js-message');
      // 如果是按住shift則不傳送訊息(多行輸入)
      if(e.shiftKey) {
        return false;
      }
      // 如果輸入是空則不傳送訊息
      if(message.value.length <= 1 && message.value.trim() == '') {
        // 避免enter產生的空白行
        e.preventDefault();
        return false;
      }
      // 對firebase的db做push, db只能接受json格式物件, 若要用陣列要先轉字串來存
      msgRef.push({
        userName: userName,
        type: 'text',
        message: message.value,
        headPicture: vm.userPic,
        timeStamp: vm.getTime()
      })
      // 清空輸入欄位避免enter產生的空白換行
      message.value = '';
      vm.scrollToBottom();
      e.preventDefault();
    },
    /** 預覽上傳群組圖片 */
    uploadGroupImage(e) {
      const vm = this;
      vm.tempImage = e.target.files[0];
      
      if(vm.tempImage) {
        var reader = new FileReader();
        reader.onload = function(e) {
          vm.previewGroupImageSrc = e.target.result;
        }
        reader.readAsDataURL(vm.tempImage);
      }
      
    },
    /** 編輯群組Modal */
    confirmGroupNameModify() {
      const vm = this;
      if(vm.modifyGroupName || vm.modifyGroupImage) {
        // 變更群組名稱
        if(vm.modifyGroupName) {
          var uploadGroupNameRef = firebase.database().ref('/groupInfo/Names/');
          uploadGroupNameRef.push({
            groupName: vm.modifyGroupName,
            editer: vm.userName
          });
          vm.modifyGroupNameMsg = '';
          vm.modifyGroupModal = false;
        }

        // 變更群組圖片
        if(vm.modifyGroupImage) {
          var uploadGroupImageRef = firebase.database().ref('/groupInfo/Images/');
          // 取得上傳的資料
          const file = vm.tempImage;
          const fileName = Math.floor(Date.now() / 1000) + `_${file.name}`;
          const metadata = {
            contentType: 'image/*'
          };
          // 上傳資訊設定
          const uploadTask = groupImgRef.child(fileName).put(file, metadata);
          // 上傳狀態處理
          uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
            /* 上傳中，打開訊息框 */
            function(snapshot) {
              if(snapshot.bytesTransferred < snapshot.totalBytes) {
                vm.isLoading = true;
              }
            },
            /* 錯誤處理 */
            function(error) {
              msgRef.child('bug/').push({
                userName: vm.userName,
                type: 'image',
                message: error.code,
                timeStamp: vm.getTime()
              })
            },
            /* 上傳結束處理 */
            function() {
              var downloadURL = '';
              var now = new Date();
              uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
                console.log("Group image file available at", url);
                downloadURL = url;
                uploadGroupImageRef.push({
                  editer: vm.userName,
                  type: 'image',
                  pictureURL: downloadURL,
                  timeStamp: now
                });

                vm.isLoading = false;
              });
            }
          )
        }
        // 重置編輯群組Modal
        vm.modifyGroupModal = false;
        vm.modifyGroupName = '';
        vm.modifyGroupNameMsg = '';
        vm.modifyGroupImage = null;
        vm.previewGroupImageSrc = '';
      }else {
        vm.modifyGroupNameMsg = '若要修改，名稱或圖片不得為空';
      }
    },
    /** 更換大頭貼 */
    changeHeadPic() {
      const vm = this;
      let inputFile = document.getElementById("headPicInput");
      inputFile.click();
    },
    /** 傳送圖片 */
    sendImage(e, isMessage) {
      console.log(e);
      const vm = this;
      const userName = vm.userName;
      // 取得上傳的資料
      const file = e.target.files[0];
      const fileName = Math.floor(Date.now() / 1000) + `_${file.name}`;
      const metadata = {
        contentType: 'image/*'
      };
      // 取得HTML進度條元素
      let progressBar = document.querySelector('#js-progressBar');
      // 上傳資訊設定
      const uploadTask = storageRef.child(fileName).put(file, metadata);
      const userTask = userRef.child(fileName).put(file, metadata);
      if(isMessage) {
        // 上傳狀態處理
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
          /* 上傳進度 */
          function(snapshot) {
            let progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if(progress < 100) {
              // 開啟進度條
              vm.upload = true;
              vm.progress = `${progress}%`;
              progressBar.setAttribute('style', `width:${progress}%`);
            }
          },
          /* 錯誤處理 */
          function(error) {
            msgRef.child('bug/').push({
              userName: userName,
              type: 'image',
              message: error.code,
              timeStamp: vm.getTime()
            })
          },
          /* 上傳結束處理 */
          function() {
            var downloadURL = '';
            uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
              console.log("File available at", url);
              downloadURL = url;
              msgRef.push({
                userName: userName,
                type: 'image',
                message: downloadURL,
                headPicture: vm.userPic,
                timeStamp: vm.getTime()
              })
            });
            // 關閉進度條
            vm.upload = false;
            vm.scrollToBottom();
          }
        )
      }else {
        var uploadUserFileRef = firebase.database().ref('/userProfile/' + userName + '/');
        vm.viewModal = false;
        // 上傳狀態處理
        userTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
          /* 上傳中，打開訊息框 */
          function(snapshot) {
            if(snapshot.bytesTransferred < snapshot.totalBytes) {
              vm.isLoading = true;
            }
          },
          /* 錯誤處理 */
          function(error) {
            msgRef.child('bug/').push({
              userName: userName,
              type: 'image',
              message: error.code,
              timeStamp: vm.getTime()
            })
          },
          /* 上傳結束處理 */
          function() {
            var downloadURL = '';
            var now = new Date();
            userTask.snapshot.ref.getDownloadURL().then(function(url) {
              console.log("File available at", url);
              downloadURL = url;
              uploadUserFileRef.push({
                userName: userName,
                type: 'image',
                pictureURL: downloadURL,
                timeStamp: now
              });

              vm.isLoading = false;
              vm.getUserHeadPicture();
            });
          }
        )
      }
    },
    /** 刪除訊息 */
    deleteMessage(id) {
      const message = msgRef.child(id)
      message.remove()
    },
    /** 顯示更多 */
    readMore(e) {
      // 把內容高度限制取消
      e.target.previousElementSibling.setAttribute('style', 'max-height: 100%;')
      // 隱藏"顯示更多"按紐
      e.target.setAttribute('style', 'display: none;');
    },
    /** 檢視大頭貼 */
    viewHeadPicture() {
      this.viewImage = this.userPic; // 將大頭貼src帶入到預覽圖片src
      this.viewImageTitle = '大頭貼檢視';
      // this.viewModal = true; // 開啟預覽Modal
      if(this.selectOtherUser !== '') { // 若有值，代表選擇其他User
        console.log(this.selectOtherUser);
        for(var i = 0; i < this.messages.length; i++) {
          if(this.messages[i].id === this.selectOtherUser) {
            // 以ID找出使用者後代入對應的大頭貼
            this.viewImage = this.messages[i].headPicture;
          }
        }
      }
      this.viewModal = true;
    },
    /* 點擊預覽圖片 */
    clickImageMessage(imageId) {
      this.currentMsgID = imageId; // 將目前訊息ID改為該訊息的ID，才會打開下載和刪除的欄位
      this.viewImage = this.userPic;
      this.viewImageTitle = '圖片預覽';
      for(var i = 0; i < this.messages.length; i++) {
        if(this.messages[i].id === imageId) {
          // 以ID找出使用者後代入對應的大頭貼
          this.viewImage = this.messages[i].message;
        }
      }
      this.viewModal = true;
    },
    /* 瀏覽其他使用者資料 */
    viewOtherUser(item) {
      const vm = this;
      vm.viewOtherUserModalTitle = item.userName;
      vm.viewOtherUserHeadPicture = item.headPicture;
      vm.viewOtherUserModal = true;
    },
    getCookie(cname) {
      var name = cname;
      console.log(document.cookie);
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while(c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if(c.indexOf(name) === 0) {
          return c.substring(name.length + 1, c.length);
        }
      }
      return '';
    },
    deleteAllCookies() {
      var cookies = document.cookie.split(";");

      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
    scrollToBottom() {
      // 把聊天視窗滾到最底部(讀取最新消息)
      const roomBody = document.querySelector('#js-roomBody');
      roomBody.scrollTop = roomBody.scrollHeight;
    },
    logOut() {
      this.deleteAllCookies();
      this.$router.push('/');
    }
  },
  // mounted是vue的生命週期之一，代表模板已編譯完成，已經取值準備渲染HTML畫面了
  mounted() {
    const vm = this;
    msgRef.on('value', function(snapshot) {
      const val = snapshot.val();
      const messageData = val
        ? Object.keys(val).map(key => ({ id: key, ...val[key] }))
        : null
      vm.messages = messageData;
    });
    // 尋找此user的大頭貼照片
    userFileRef.on('value', function(snapshot) {
      const val = snapshot.val();
      if(val !== null && val !== undefined) {
        vm.userList = val;
        // 因為同步關係，所以放在裡面做，才會先取得user file(取得user大頭貼)再儲存名字
        let cookie = vm.getCookie('name');
        if(cookie) {
          vm.saveName(cookie);
        }else {
          vm.$router.push('/');
        }
      }
    });
    groupRef.on('value', function(snapshot) {
      const val = snapshot.val();
      const groupNameList = val.Names
        ? Object.keys(val.Names).map(key => ({ id: key, ...val.Names[key] }))
        : null;
      
      const groupImageList = val.Images
        ? Object.keys(val.Images).map(key => ({ id: key, ...val.Images[key] }))
        : null;
      
      vm.groupName = groupNameList[groupNameList.length-1].groupName; // 只取最後一筆最新的
      vm.groupImage = groupImageList[groupImageList.length-1].pictureURL; // 只取最後一筆最新的
    });
  },
  // update是vue的生命週期之一，接在munted後方代表HTML元件渲染完成後
  updated() {
    // 判斷內容高度超過300就隱藏起來，把"顯示更多"按紐打開
    const messages = document.querySelectorAll('.messageBox__message');
    //console.log(messages);
    messages.forEach((message) => {
      if(message.offsetHeight > 300) {
        message.querySelector('.message__readMore').setAttribute('style', 'display: block');
      }
    });
    if(this.firstOpen) {
      // 當畫面渲染完成，把聊天視窗滾到最底部(讀取最新消息)
      this.scrollToBottom();
      this.firstOpen = false; // 防止點選訊息視窗滑到最底部
    }
  }
}
</script>

<style>
/* 聊天室 */
.roomHeadView {
    background-color: darkgray
}
.roomBodyView {
    background-color: #fff;
    height: 50vh;
    overflow-y: auto;
    overflow-x: hidden;
}
.roomBottom {
  bottom: 0px;
  border-radius: 0px 0px 5px 5px;
  background-color: #FFFFFF;
}
.disablePadding {
  margin: -1.25rem -1.25rem 0 -1.25rem;
  padding: 0;
  text-align: left;
}
.roomBottom__tools {
  border-top: solid 1px #E7E7E7;
  border-bottom: solid 2px #E7E7E7;
  background-color: #F6F6F6;
  height: 30px;
  padding: 0px 5px;
  text-align: left;
}
.roomBottom__input {
  padding: 10px 10px 5px 10px;
}
.roomBottom__input__textarea {
  width: 100%;
  height: 60px;
  border: none;
  resize: none;
  outline: none;
}

/* 上傳檔案圖示 */
.roomBottom__tools_upload {
  padding: 8px 0px 0px 5px;
}
input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
.file-upload-style {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  height: 100%;
}
.file-upload-style:hover {
  border: solid 0.5px #DCDCDC;
}

/* 瀏覽其他使用者Modal */
.view-other-user-picture {
  max-width:250px;
  max-height:250px;
  border: solid 3px #DCDCDC;
  overflow: hidden;
}

/* card without border */
.cardWithoutBorder {
    border: 0px !important;
    
}
.cardWithoutBorder img {
  border-radius: 50%;
}
/* media */
@media screen and (max-width: 425px) {
  .messageBox__content {
    max-width: 60%;
  }
}
@media screen and (max-width: 385px) {
  .messageBox__content {
    max-width: 50%;
  }
}
/* message */
.messageBox {
  padding: 5px 10px;
  position: relative;
  text-align: left;
}
.messageBox__user {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  vertical-align: top;
  display: inline-block;
  cursor: pointer;
}
.messageBox__content {
  max-width: 70%;
  display: inline-block;
  text-align: left;
}
.messageBox__name {
  margin: 5px 0px 5px 5px;
  font-size: 13px;
  color: #727C8A;
  vertical-align: top;
  cursor: pointer;
}
.messageBox__message {
  margin: 5px 0px 5px 5px;
  font-size: 12px;
  color: #35393D;
  letter-spacing: 0.6px;
  background-color: #E3E8EB;
  border-radius: 12px;
  line-height: 1.5;
  text-align: left;
  word-break: break-all;
  /*：與html的<pre></pre>同效果，可以使textarea的換行元素正常顯示 */
  white-space: pre-line;
  cursor: pointer;
  display: inline-block;
}
.messageBox__text {
  padding: 8px 10px 9px 11px;
  max-height: 300px;
  overflow: hidden;
}
.messageBox__readMore {
  border-top: 1px solid #D9DBDD;
  margin-top: 6px;
  padding: 6px 13px 10px 13px;
  left: 0;
  right: 0;
  cursor: pointer;
  display: none;
}
.messageBox__image {
  margin: 5px 25px 5px 5px;
  cursor: pointer;
}
.messageBox__image img {
  border-radius: 5px;
  max-width: 180px;
  max-height: 50px;
}
.messageBox__time {
  transform: scale(0.7);
  color: #ACB0B8;
  vertical-align: bottom;
  margin: 50px 0px 5px -12px;
  display: inline-block;
}
.messageBox__delete {
  font-size: 12px;
  color: #ACB0B8;
  margin-right: 25px;
  cursor: pointer;
}
.messageBox__progress {
  width: 25%;
  margin-right: 60px;
  border-radius: 5px;
  background-color: #D4D9E1;
  height: 6px;
}
.messageBox__progress--state {
  background-color: #00CE00;
  height: 6px;
  width: 10%;
  border-radius: 5px;
  float: right;
}
.messageBox__progress--number {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 12px;
  color: #B7B7B7;
  margin-right: 35px;
}
.messageBox--self {
  text-align: right;
}
.messageBox--self .messageBox__message {
  background-color: #AFF47E;
  margin-right: 25px;
}
.messageBox--self .messageBox__message__text {
  padding: 8px 10px 9px 11px;
  max-height: 100%;
  overflow: unset;
}
.messageBox--self .messageBox__time {
  margin: 0px -16px 5px 0px;
}

</style>