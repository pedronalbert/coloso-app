import React, { Component, PropTypes } from 'react';
import { View, StyleSheet, Dimensions, BackAndroid, Text, ScrollView } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modalbox';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';
import I18n from 'i18n-js';
import colors from '../../utils/colors';
import denormalize from '../../utils/denormalize';
import Team from './Team';
import { fetchProBuilds } from '../../redux/actions/GameCurrentViewActions';
import { fetchProPlayers } from '../../redux/actions/ProPlayersActions';
import RunePage from '../../components/RunePage';
import MasteryPage from '../../components/MasteryPage';
import ProBuildsList from '../../components/ProBuildsList';
import ProPlayersSelector from '../../components/ProPlayersSelector';
import { tracker } from '../../utils/analytics';
import Toolbar from './Toolbar';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    padding: 16,
    flex: 1,
  },
});

function getModalStyle() {
  const { height: deviceHeight, width: deviceWidth } = Dimensions.get('window');
  const modalStyle = {
    height: null,
    maxHeight: deviceHeight * 0.8,
    padding: 16,
  };

  // Mobil
  if (deviceWidth < 600) {
    modalStyle.width = 300;
  } else {
    modalStyle.width = 550;
  }

  return modalStyle;
}

class GameCurrentView extends Component {
  constructor(props) {
    super(props);

    this.getTeamData = this.getTeamData.bind(this);
    this.getSummonerRunes = this.getSummonerRunes.bind(this);
    this.getSummonerMasteries = this.getSummonerMasteries.bind(this);
    this.handleOnPressRunesButton = this.handleOnPressRunesButton.bind(this);
    this.handleOnPressMasteriesButton = this.handleOnPressMasteriesButton.bind(this);
    this.handleOnPressProfileButton = this.handleOnPressProfileButton.bind(this);
    this.handleOnChangeTab = this.handleOnChangeTab.bind(this);
    this.handleOnLoadMoreBuilds = this.handleOnLoadMoreBuilds.bind(this);
    this.handleOnChangeProPlayerSelected = this.handleOnChangeProPlayerSelected.bind(this);
    this.state = {
      summonerSelectedId: null,
      modalType: null,
      modalIsOpen: false,
    };
  }

  componentWillMount() {
    this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', this.handleOnBackAndroid.bind(this));

    if (!this.props.proPlayers.get('isFetched')) {
      this.props.fetchProPlayers();
    }
  }

  componentDidMount() {
    tracker.trackScreenView('GameCurrentView');
  }

  componentWillUnmount() {
    this.backAndroidListener.remove();
  }

  getTeamData(teamId) {
    const participants = this.props.gameData.get('participants').filter(participant => participant.get('teamId') === teamId);
    const bannedChampions = this.props.gameData.get('bannedChampions').filter(bannedChamp => bannedChamp.get('teamId') === teamId);

    return {
      participants,
      bannedChampions,
    };
  }

  getSummonerRunes(summonerUrid) {
    return this.props.gameData.get('participants').find(participant => participant.get('summonerUrid') === summonerUrid).get('runes');
  }

  getSummonerMasteries(summonerUrid) {
    return this.props.gameData.get('participants').find(participant => participant.get('summonerUrid') === summonerUrid).get('masteries');
  }

  getFocusChampionId() {
    const focusSummonerUrid = this.props.gameData.get('focusSummonerUrid');

    if (focusSummonerUrid) {
      const participantFound = this.props.gameData.get('participants').find(participant => participant.get('summonerUrid') === focusSummonerUrid);

      if (participantFound) {
        const championId = participantFound.get('championId');

        return championId;
      }
    }

    return 0;
  }

  handleOnPressRunesButton(summonerUrid) {
    this.setState({ summonerSelectedId: summonerUrid, modalType: 'RUNES' });
    this.modal.open();
  }

  handleOnPressMasteriesButton(summonerUrid) {
    this.setState({ summonerSelectedId: summonerUrid, modalType: 'MASTERIES' });
    this.modal.open();
  }

  handleOnPressProfileButton(summonerUrid) {
    Actions.summoner_profile_view({ summonerUrid });
  }

  handleOnBackAndroid() {
    if (this.state.modalIsOpen) {
      this.modal.close();
      return true;
    }

    return false;
  }

  handleOnChangeTab({ i: tabIndex }) {
    if (tabIndex === 1 && !this.props.proBuilds.get('fetched')) {
      this.props.fetchProBuilds({ championId: this.getFocusChampionId() }, 1);
    }
  }

  handleOnLoadMoreBuilds() {
    const pagData = this.props.proBuilds.get('pagination');
    if (!this.props.proBuilds.get('isFetching') && pagData.get('pageCount') > pagData.get('page')) {
      this.props.fetchProBuilds({
        championId: this.getFocusChampionId(),
        proPlayerId: this.props.proBuilds.get('proPlayerSelected'),
      }, pagData.get('page') + 1);
    }
  }

  handleOnChangeProPlayerSelected(proPlayerId) {
    this.props.fetchProBuilds({
      championId: this.getFocusChampionId(),
      proPlayerId,
    }, 1);
  }

  render() {
    const { proBuilds, gameData } = this.props;
    const proBuildsList = proBuilds.get('proBuildsList');
    let modalContent;
    let proBuildsContent;

    if (proBuildsList.size > 0 || proBuilds.get('isFetching')) {
      proBuildsContent = (<ProBuildsList
        builds={proBuildsList}
        onPressBuild={buildId => Actions.probuild_view({ buildId })}
        isFetching={proBuilds.get('isFetching')}
        onLoadMore={this.handleOnLoadMoreBuilds}
      />);
    } else {
      proBuildsContent = (<View style={styles.container}>
        <Text>
          {I18n.t('pro_builds_not_available')}
        </Text>
      </View>);
    }

    if (this.state.modalType === 'RUNES') {
      modalContent = (<View>
        <Text style={styles.modalTitle}>{I18n.t('runes')}</Text>
        <RunePage
          page={Immutable.Map({ runes: this.getSummonerRunes(this.state.summonerSelectedId) })}
        />
      </View>);
    } else if (this.state.modalType === 'MASTERIES') {
      modalContent = (<View>
        <Text style={styles.modalTitle}>{I18n.t('masteries')}</Text>
        <MasteryPage
          page={Immutable.Map({
            masteries: this.getSummonerMasteries(this.state.summonerSelectedId),
          })}
        />
      </View>);
    }

    return (<View style={styles.root}>
      <Toolbar
        mapId={gameData.get('mapId')}
        gameQueueConfigId={gameData.get('gameQueueConfigId')}
        onPressBackButton={() => Actions.pop()}
      />
      <ScrollableTabView
        tabBarBackgroundColor={colors.primary}
        tabBarActiveTextColor={colors.accent}
        tabBarInactiveTextColor="rgba(255,255,255,0.8)"
        tabBarUnderlineStyle={{ backgroundColor: colors.accent }}
        renderTabBar={() => <DefaultTabBar />}
        onChangeTab={this.handleOnChangeTab}
      >
        <View style={{ flex: 1 }} tabLabel={I18n.t('players')}>
          <ScrollView>
            <Team
              {...this.getTeamData(100)}
              onPressRunesButton={this.handleOnPressRunesButton}
              onPressMasteriesButton={this.handleOnPressMasteriesButton}
              onPressProfileButton={this.handleOnPressProfileButton}
            />
            <Team
              {...this.getTeamData(200)}
              onPressRunesButton={this.handleOnPressRunesButton}
              onPressMasteriesButton={this.handleOnPressMasteriesButton}
              onPressProfileButton={this.handleOnPressProfileButton}
            />
          </ScrollView>
        </View>
        <View tabLabel={I18n.t('pro_builds')} style={{ flex: 1 }}>
          <ProPlayersSelector
            proPlayers={this.props.proPlayers.get('proPlayersList')}
            style={{ paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.1)' }}
            disabled={this.props.proBuilds.get('isFetching')}
            onChangeSelected={this.handleOnChangeProPlayerSelected}
          />
          {proBuildsContent}
        </View>
      </ScrollableTabView>
      <Modal
        position="center"
        style={getModalStyle()}
        swipeToClose={false}
        ref={(modal) => { this.modal = modal; }}
        onOpened={() => this.setState({ modalIsOpen: true })}
        onClosed={() => this.setState({ modalIsOpen: false })}
      >
        {modalContent}
      </Modal>
    </View>);
  }
}

GameCurrentView.propTypes = {
  gameData: ImmutablePropTypes.mapContains({
    participants: ImmutablePropTypes.list,
    mapId: PropTypes.number,
    gameQueueConfigId: PropTypes.number,
    gameLength: PropTypes.number,
    region: PropTypes.string,
    gameStartTime: PropTypes.number,
    focusSummonerUrid: PropTypes.string,
  }),
  proBuilds: ImmutablePropTypes.mapContains({
    isFetching: PropTypes.bool,
    fetched: PropTypes.bool,
    fetchError: PropTypes.bool,
    errorMessage: PropTypes.string,
    proBuildsList: ImmutablePropTypes.list,
    pagination: ImmutablePropTypes.mapContains({
      currentPage: PropTypes.number,
      totalPages: PropTypes.number,
    }),
  }),
  proPlayers: ImmutablePropTypes.mapContains({
    isFetching: PropTypes.bool,
    proPlayersList: ImmutablePropTypes.list,
  }),
  fetchProBuilds: PropTypes.func,
  fetchProPlayers: PropTypes.func,
};

function mapStateToProps(state) {
  let proBuilds = state.gameCurrentView.get('proBuilds');
  let proPlayers = state.proPlayers;
  const proBuildsIds = state.gameCurrentView.getIn(['proBuilds', 'proBuildsIds']);
  const proPlayersIds = proPlayers.get('proPlayersIds');
  const gameData = denormalize(state.gameCurrentView.get('gameId'), 'gamesCurrent', state.entities);

  proBuilds = proBuilds.set('proBuildsList', proBuildsIds.map(proBuildId => denormalize(proBuildId, 'proBuilds', state.entities)));
  proPlayers = proPlayers.set('proPlayersList', proPlayersIds.map(proPlayerId => denormalize(proPlayerId, 'proPlayers', state.entities)));

  return { gameData, proBuilds, proPlayers };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchProBuilds: (queryParams, page) => {
      dispatch(fetchProBuilds(queryParams, page));
    },
    fetchProPlayers: () => {
      dispatch(fetchProPlayers());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GameCurrentView);
