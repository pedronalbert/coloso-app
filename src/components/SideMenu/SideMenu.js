import React, { PureComponent, PropTypes } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';
import _ from 'lodash';
import DeviceInfo from 'react-native-device-info';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Icon from 'react-native-vector-icons/MaterialIcons';
import I18n from 'i18n-js';

import regionHumanize from '../../utils/regionHumanize';
import colors from '../../utils/colors';
import MenuItem from './MenuItem';
import ProfileImage from '../ProfileImage';

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'white',
    flex: 1,
    width: 240,
    position: 'relative',
  },
  header: {
    width: 240,
    height: 150,
    paddingHorizontal: 18,
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  headerImage: {
    width: 240,
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  accountDataContainer: {
    flexDirection: 'row',
  },
  accountImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 50,
    borderColor: '#FFF',
    marginRight: 12,
  },
  noAccountCircle: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 50,
    height: 50,
  },
  accountDataRow: {
    justifyContent: 'center',
  },
  accountDataText: {
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
  },
  summonerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: {
      width: 1.5,
      height: 1.5,
    },
  },
  versionText: {
    position: 'absolute',
    bottom: 0,
    right: 8,
  },
});

class SideMenu extends PureComponent {
  constructor(props) {
    super(props);

    this.renderAccountData = this.renderAccountData.bind(this);
  }

  renderAccountData() {
    const ownerAccount = this.props.ownerAccount;

    if (_.isNull(ownerAccount.get('summonerUrid'))) {
      return (<TouchableWithoutFeedback
        onPress={this.props.onPressManageAccount}
      >
        <View style={styles.accountDataContainer}>
          <View style={[styles.accountImage, styles.noAccountCircle]}>
            <Icon name="add" size={20} color="#FFF" />
          </View>
          <View style={styles.accountDataRow}>
            <Text style={styles.accountDataText}>{I18n.t('add_account')}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>);
    }

    return (<TouchableWithoutFeedback
      onPress={this.props.onPressManageAccount}
    >
      <View style={styles.accountDataContainer}>
        <ProfileImage id={ownerAccount.get('profileIconId')} style={styles.accountImage} />
        <View style={styles.accountDataRow}>
          <Text style={styles.summonerName}>{ownerAccount.get('summonerName')}</Text>
          <Text style={styles.accountDataText}>{regionHumanize(ownerAccount.get('region'))}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>);
  }

  render() {
    return (<View style={styles.root}>
      <View style={styles.header}>
        {this.renderAccountData()}
      </View>
      <ScrollView>
        <MenuItem
          iconName="account-circle"
          title={I18n.t('my_account')}
          onPress={this.props.onPressProfile}
        />

        <MenuItem
          iconName="games"
          title={I18n.t('my_game')}
          onPress={this.props.onPressMyGame}
        />

        <MenuItem
          iconName="search"
          title={I18n.t('searches')}
          onPress={this.props.onPressSummonerSearch}
        />

        <MenuItem
          title={I18n.t('pro_builds')}
          iconName="gavel"
          onPress={this.props.onPressProBuilds}
        />

        <MenuItem
          title={I18n.t('suggestion')}
          iconName="mail"
          onPress={this.props.onPressSuggestion}
        />
      </ScrollView>

      <Text style={styles.versionText}>v{DeviceInfo.getVersion()}</Text>
    </View>);
  }
}

SideMenu.propTypes = {
  ownerAccount: ImmutablePropTypes.mapContains({
    summonerUrid: PropTypes.string,
    summonerName: PropTypes.string,
    profileIconId: PropTypes.number,
    region: PropTypes.string,
  }),
  onPressSuggestion: PropTypes.func,
  onPressProfile: PropTypes.func,
  onPressProBuilds: PropTypes.func,
  onPressSummonerSearch: PropTypes.func,
  onPressMyGame: PropTypes.func,
  onPressManageAccount: PropTypes.func,
};

export default SideMenu;