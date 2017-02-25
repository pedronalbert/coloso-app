import React, { Component, PropTypes } from 'react';
import { View, Text, Image } from 'react-native';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { MediaQueryStyleSheet } from 'react-native-responsive';
import I18n from 'i18n-js';

import IconButton from '../../../components/IconButton';
import regionHumanize from '../../../utils/regionHumanize';
import colors from '../../../utils/colors';

const styles = MediaQueryStyleSheet.create(
  {
    root: {
      backgroundColor: colors.primary,
    },

    profileToolbar: {
      marginTop: -56,
      paddingTop: 18,
      paddingBottom: 8,
      minHeight: 100,
    },

    profileToolbarContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },

    loadingText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },

    backgroundImage: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    summonerImageContainer: {
      width: 70,
      height: 70,
      position: 'relative',
      alignSelf: 'center',
      justifyContent: 'center',
      borderColor: colors.accent,
      borderRadius: 50,
      borderWidth: 4,
      alignItems: 'center',
    },

    summonerImage: {
      width: 64,
      height: 64,
      borderRadius: 50,
    },

    summonerLevelContainer: {
      position: 'absolute',
      width: 20,
      height: 20,
      backgroundColor: colors.accent,
      bottom: 0,
      right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
    },

    summonerDataContainer: {
      marginLeft: 18,
      justifyContent: 'center',
    },

    summonerLevelText: {
      color: 'black',
      textAlign: 'center',
      fontSize: 12,
    },

    summonerNameText: {
      fontSize: 16,
      color: '#FFF',
      textShadowColor: '#000',
      textShadowOffset: {
        width: 2,
        height: 2,
      },
    },

    regionText: {
      color: '#FFF',
      textAlign: 'center',
      textShadowColor: '#000',
      textShadowOffset: {
        width: 1.5,
        height: 1.5,
      },
    },
  },
  {
    '@media (min-device-width: 600)': {
      profileToolbar: {
        minHeight: 100,
      },

      profileToolbarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },

      summonerImageContainer: {
        width: 100,
        height: 100,
      },

      summonerImage: {
        width: 90,
        height: 90,
      },

      summonerLevelContainer: {
        width: 30,
        height: 30,
      },

      summonerLevelText: {
        fontSize: 16,
      },

      summonerDataContainer: {
        marginLeft: 40,
        justifyContent: 'center',
      },
      summonerNameText: {
        fontSize: 26,
        textAlign: 'left',
      },
      regionText: {
        fontSize: 18,
        textAlign: 'left',
      },
    },
  },
);

function getImageUri(profileIconId) {
  return `http://ddragon.leagueoflegends.com/cdn/7.2.1/img/profileicon/${profileIconId}.png`;
}

class SummonerProfileViewToolbar extends Component {
  constructor(props) {
    super(props);

    this.handleOnPressBackButton = this.handleOnPressBackButton.bind(this);
  }

  handleOnPressBackButton() {
    if (this.props.onPressBackButton) {
      return this.props.onPressBackButton();
    }

    return null;
  }

  render() {
    const { summonerData } = this.props;

    return (<View style={styles.root}>
      <View style={styles.toolbar}>
        <IconButton iconName="arrow-back" onPress={this.handleOnPressBackButton} />
      </View>

      <View style={styles.profileToolbar}>
        {summonerData.get('isFetching') ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.loadingText}>{I18n.t('loading')}...</Text>
          </View>
        ) : (
          <View style={styles.profileToolbarContainer}>
            <View style={styles.summonerImageContainer}>
              <Image
                style={styles.summonerImage}
                source={{ uri: getImageUri(summonerData.getIn(['data', 'profileIconId'])) }}
              />
              <View style={styles.summonerLevelContainer}>
                <Text style={styles.summonerLevelText}>{summonerData.getIn(['data', 'summonerLevel'])}</Text>
              </View>
            </View>

            <View style={styles.summonerDataContainer}>
              <Text style={styles.summonerNameText}>{summonerData.getIn(['data', 'name'])}</Text>
              <Text style={styles.regionText}>{regionHumanize(summonerData.getIn(['data', 'region']))}</Text>
            </View>
          </View>
        )}
      </View>
    </View>);
  }
}


SummonerProfileViewToolbar.propTypes = {
  summonerData: ImmutablePropTypes.map,
  onPressBackButton: PropTypes.func,
};

export default SummonerProfileViewToolbar;
