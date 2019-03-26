import React, {Component} from 'react';
import { AsyncStorage, Alert, View, Text, TextInput, Linking, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state={
      fcmToken:''
    }
  }

  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners(); //add this line
  }

////////////////////// Add these methods //////////////////////

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }
    // Build your notification
    const notification = new firebase.notifications.Notification()
      .setTitle('Android Notification Actions')
      .setBody('Action Body')
      .setNotificationId('notification-action')
      .setSound('default')
      .android.setChannelId('notification-action')
      .android.setPriority(firebase.notifications.Android.Priority.Max);
// Build an action
    const action = new firebase.notifications.Android.Action('test_action', 'ic_launcher', 'My Test Action');

// Build a remote input
    const remoteInput = new firebase.notifications.Android.RemoteInput('inputText')
      .setLabel('Message');

// Add the remote input to the action
    action.addRemoteInput(remoteInput);

// Add the action to the notification
    notification.android.addAction(action);

    console.log(action, "0000000000000", notification)

// Display the notification
    firebase.notifications().displayNotification(notification);
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }


//1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
    console.log("fcmToken", fcmToken)
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  _sendMsg = () => {
   // Linking.openURL('whatsapp://send?text=hello&phone=+917600710026')
    Linking.openURL('tel:+917600710026')
  }

  render() {
    console.log("in app ")
    return (
      <View style={{flex: 1}}>
        <Text>Welcome to React Native!</Text>
        <TextInput style={{height:100, width:100 }} value={this.state.fcmToken} />
        <TouchableOpacity onPress={this._sendMsg.bind(this)} >
          <Text>Send Wp</Text>
        </TouchableOpacity>

      </View>
    );
  }
}
