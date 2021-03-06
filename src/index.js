import React, { Component, PropTypes } from 'react';
import { Linking } from 'react-native';
import { Provider } from 'react-redux';
import Dialog from 'react-native-dialogs';
import DeviceInfo from 'react-native-device-info';
import I18n from 'i18n-js';
import moment from 'moment';
import { setTheme } from 'react-native-material-kit';
import 'moment/locale/es';
import 'moment/locale/pt';

import { ColosoClient, versionChecker, logger, colors } from 'utils';
import RootContainer from './containers/RootContainer';
import translations from './translations';
import { loadSettings } from './modules/AppSettingsActions';

I18n.translations = translations;

setTheme({
  primaryColor: colors.primary,
  accentColor: colors.accent,
});

const LANGS = ['en', 'es', 'pt'];

function configureLocale() {
  const deviceLocale = DeviceInfo.getDeviceLocale().slice(0, 2).toLowerCase();
  let locale;

  if (LANGS.includes(deviceLocale)) {
    locale = deviceLocale;
    logger.debug(`Locale loaded from device: ${deviceLocale}`);
  } else {
    locale = LANGS[0];
    logger.debug('Locale default: ', locale);
  }

  I18n.locale = locale;
  ColosoClient.setLocale(locale);
  moment.locale(locale);
}

function goToPlayStore() {
  const playstoreUrl = 'market://details?id=com.pedronalbert.lolcena';
  Linking.openURL(playstoreUrl);
}

function checkVersion() {
  versionChecker()
    .then(({ state }) => {
      if (state === 'UPDATED') {
        return;
      }

      const dialog = new Dialog();
      const dialogOptions = {
        cancelable: false,
      };

      if (state === 'UPDATE_AVAILABLE') {
        dialogOptions.title = I18n.t('update_available');
        dialogOptions.content = I18n.t('update_available_message');
        dialogOptions.positiveText = I18n.t('continue');
        dialogOptions.negativeText = I18n.t('update');
        dialogOptions.onNegative = goToPlayStore;
      } else if (state === 'UPDATE_REQUIRED') {
        dialogOptions.title = I18n.t('update_required');
        dialogOptions.content = I18n.t('update_required_message');
        dialogOptions.negativeText = I18n.t('update');
        dialogOptions.onNegative = () => {
          goToPlayStore();
          dialog.show();
        };
      }

      dialog.set(dialogOptions);
      dialog.show();
    });
}

class AppContainer extends Component {
  componentWillMount() {
    configureLocale();
    checkVersion();
  }

  shouldComponentUpdate() {
    return false;
  }

  loadAppSettings() {
    this.props.store.dispatch(loadSettings());
  }

  render() {
    return (<Provider store={this.props.store}>
      <RootContainer />
    </Provider>);
  }
}

AppContainer.propTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func,
  }).isRequired,
};

export default AppContainer;
