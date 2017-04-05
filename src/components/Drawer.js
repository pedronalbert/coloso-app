import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Drawer from 'react-native-drawer';
import { Actions, DefaultRenderer } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import Dialog from 'react-native-dialogs';
import { RNMail as Mailer } from 'NativeModules';
import _ from 'lodash';
import I18n from 'i18n-js';

import SideMenu from './SideMenu';


const SUGGESTION_EMAIL = 'pedron.albert@gmail.com';

const suggestionTemplate = `====== Required Info ======
App Version: ${DeviceInfo.getVersion()}
Device: ${DeviceInfo.getBrand()} (${DeviceInfo.getModel()})
System Version: ${DeviceInfo.getSystemVersion()} (${DeviceInfo.getSystemName()})
Locale: ${DeviceInfo.getDeviceLocale()}
Timezone: ${DeviceInfo.getTimezone()}
========================
Suggestion: `;

function showAddAccountDialog() {
  const dialog = new Dialog();
  dialog.set({
    content: I18n.t('have_to_add_account'),
    positiveText: 'OK',
  });
  dialog.show();
}

function handleOnPressSuggestion() {
  Mailer.mail({
    subject: 'Coloso - Suggestion',
    recipients: [SUGGESTION_EMAIL],
    body: suggestionTemplate,
  }, () => {});
}

class MainDrawer extends PureComponent {
  constructor(props) {
    super(props);

    this.handleOnPressMyGame = this.handleOnPressMyGame.bind(this);
    this.handleOnPressProfile = this.handleOnPressProfile.bind(this);
    this.handleOnPressProBuilds = this.handleOnPressProBuilds.bind(this);
    this.handleOnPressSummonerSearch = this.handleOnPressSummonerSearch.bind(this);
    this.handleOnPressManageAccount = this.handleOnPressManageAccount.bind(this);
    this.getSummonerAccountUrid = this.getSummonerAccountUrid.bind(this);
  }

  componentWillMount() {
    this.props.loadAccount();
  }


  getSummonerAccountUrid() {
    return this.props.ownerAccount.get('summonerUrid');
  }

  handleOnPressMyGame() {
    const summonerAccountUrid = this.getSummonerAccountUrid();

    if (_.isNull(summonerAccountUrid)) {
      showAddAccountDialog();
      Actions.manageAccountView();
      this.drawer.close();
    } else if (!this.props.isSearchingGame) {
      const { ownerAccount } = this.props;
      Actions.summonerSearchView();
      this.drawer.close();
      this.props.searchGame(ownerAccount.get('summonerName'), ownerAccount.get('region'));
    }
  }

  handleOnPressProfile() {
    const summonerAccountUrid = this.getSummonerAccountUrid();

    if (_.isNull(summonerAccountUrid)) {
      showAddAccountDialog();
      Actions.manageAccountView();
      this.drawer.close();
    } else if (!this.props.isSearchingGame) {
      Actions.summonerProfileView({ summonerUrid: summonerAccountUrid });
      this.drawer.close();
    }
  }

  handleOnPressProBuilds() {
    Actions.proBuildsListView();
    this.drawer.close();
  }

  handleOnPressSummonerSearch() {
    Actions.summonerSearchView();
    this.drawer.close();
  }

  handleOnPressManageAccount() {
    Actions.manageAccountView();
    this.drawer.close();
  }

  render() {
    const state = this.props.navigationState;
    const children = state.children;

    return (<Drawer
      open={state.open}
      onOpen={() => Actions.refresh({ key: state.key, open: true })}
      onClose={() => Actions.refresh({ key: state.key, open: false })}
      type="overlay"
      content={<SideMenu
        ownerAccount={this.props.ownerAccount}
        onPressMyGame={this.handleOnPressMyGame}
        onPressSuggestion={handleOnPressSuggestion}
        onPressProBuilds={this.handleOnPressProBuilds}
        onPressProfile={this.handleOnPressProfile}
        onPressSummonerSearch={this.handleOnPressSummonerSearch}
        onPressManageAccount={this.handleOnPressManageAccount}
      />}
      captureGestures
      panOpenMask={0.02}
      panCloseMask={0.2}
      tapToClose
      negotiatePan
      ref={(drawer) => { this.drawer = drawer; }}
      tweenHandler={ratio => ({
        mainOverlay: {
          backgroundColor: `rgba(0,0,0,0.${ratio * 3})`,
        },
      })}
    >
      <DefaultRenderer navigationState={children[0]} onNavigate={this.props.onNavigate} />
    </Drawer>);
  }
}

MainDrawer.propTypes = {
  navigationState: PropTypes.shape({}),
  isSearchingGame: PropTypes.bool,
  onNavigate: PropTypes.func,
  ownerAccount: ImmutablePropTypes.map,
  loadAccount: PropTypes.func,
  searchGame: PropTypes.func,
};

export default MainDrawer;