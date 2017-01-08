import React, { Component, PropTypes } from 'react';
import { View, StyleSheet, Dimensions, BackAndroid, Text, ScrollView } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modalbox';
import _ from 'lodash';
import colors from '../../utils/colors';
import Team from './Team';
import { fetchBuilds } from '../../redux/actions/GameCurrentViewActions';
import RunePage from '../../components/RunePage';
import MasteryPage from '../../components/MasteryPage';
import ProBuildsList from '../../components/ProBuildsList';
import ErrorScreen from '../../components/ErrorScreen';
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

const PAGESIZE = 25;

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
    this.fetchBuilds = this.fetchBuilds.bind(this);
    this.state = {
      summonerSelectedId: null,
      modalType: null,
      modalIsOpen: false,
    };
  }

  componentWillMount() {
    this.backAndroidListener = BackAndroid.addEventListener('hardwareBackPress', this.handleOnBackAndroid.bind(this));
  }

  componentDidMount() {
    tracker.trackScreenView('GameCurrentView');
  }

  componentWillUnmount() {
    this.backAndroidListener.remove();
  }
  getTeamData(teamId) {
    const { gameData } = this.props;
    const participants = _.filter(gameData.participants, { teamId });
    const bannedChampions = _.filter(gameData.bannedChampions, { teamId });

    return {
      participants,
      bannedChampions,
    };
  }

  getSummonerRunes(summonerId) {
    return _.find(this.props.gameData.participants, { summonerId }).runes;
  }

  getSummonerMasteries(summonerId) {
    return _.find(this.props.gameData.participants, { summonerId }).masteries;
  }

  handleOnPressRunesButton(summonerId) {
    this.setState({ summonerSelectedId: summonerId, modalType: 'RUNES' });
    this.modal.open();
  }

  handleOnPressMasteriesButton(summonerId) {
    this.setState({ summonerSelectedId: summonerId, modalType: 'MASTERIES' });
    this.modal.open();
  }

  handleOnPressProfileButton(summonerId) {
    Actions.summoner_profile_view({ summonerId, region: this.props.gameData.region });
  }

  handleOnBackAndroid() {
    if (this.state.modalIsOpen) {
      this.modal.close();
      return true;
    }

    return false;
  }

  handleOnChangeTab({ i: tabIndex }) {
    if (tabIndex === 1 && !this.props.builds.fetched) {
      this.fetchBuilds(1);
    }
  }

  handleOnLoadMoreBuilds() {
    const pagData = this.props.builds.pagination;
    if (!this.props.builds.isFetching && pagData.pageCount > pagData.page) {
      this.fetchBuilds(
        pagData.page + 1,
        PAGESIZE,
      );
    }
  }

  fetchBuilds(page) {
    if (this.props.gameData && this.props.gameData.focusSummonerId) {
      const focusSummonerId = this.props.gameData.focusSummonerId;
      const participant = _.find(this.props.gameData.participants, { summonerId: focusSummonerId });

      if (participant) {
        const championId = participant.championId;

        this.props.fetchBuilds(championId, page);
      }
    }
  }

  render() {
    const { builds } = this.props;
    let modalContent;
    let proBuildsContent;

    if (builds.fetchError) {
      proBuildsContent = (<View style={styles.container}>
        <ErrorScreen
          message={builds.errorMessage}
          onPressRetryButton={() => { this.fetchBuilds(); }}
          retryButton
        />
      </View>);
    } else if (builds.builds.length > 0 || builds.isFetching) {
      proBuildsContent = (<ProBuildsList
        builds={builds.builds}
        onPressBuild={buildId => Actions.probuild_view({ buildId })}
        isFetching={builds.isFetching}
        onLoadMore={this.handleOnLoadMoreBuilds}
      />);
    } else {
      proBuildsContent = (<View style={styles.container}>
        <Text>
          Actualmente no hay builds disponibles para este campeon, pronto estaran disponibles!.
        </Text>
      </View>);
    }

    if (this.state.modalType === 'RUNES') {
      modalContent = (<View>
        <Text style={styles.modalTitle}>Runas</Text>
        <RunePage
          page={{ runes: this.getSummonerRunes(this.state.summonerSelectedId) }}
        />
      </View>);
    } else if (this.state.modalType === 'MASTERIES') {
      modalContent = (<View>
        <Text style={styles.modalTitle}>Maestrias</Text>
        <MasteryPage
          page={{ masteries: this.getSummonerMasteries(this.state.summonerSelectedId) }}
        />
      </View>);
    }

    return (<View style={styles.root}>
      <Toolbar
        mapId={this.props.gameData.mapId}
        gameQueueConfigId={this.props.gameData.gameQueueConfigId}
        gameLength={this.props.gameData.gameLength}
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
        <View style={{ flex: 1 }} tabLabel="Jugadores">
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
        <View tabLabel="Builds Profesionales" style={{ flex: 1 }}>
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
  gameData: PropTypes.shape({
    participants: PropTypes.array,
    mapId: PropTypes.number,
    gameQueueConfigId: PropTypes.number,
    gameLength: PropTypes.number,
    region: PropTypes.string,
    gameStartTime: PropTypes.number,
    focusSummonerId: PropTypes.number,
  }),
  builds: PropTypes.shape({
    isFetching: PropTypes.bool,
    fetched: PropTypes.bool,
    fetchError: PropTypes.bool,
    errorMessage: PropTypes.string,
    builds: PropTypes.arrayOf(PropTypes.shape({})),
    pagination: PropTypes.shape({
      page: PropTypes.number,
      pageSize: PropTypes.number,
    }),
  }),
  fetchBuilds: PropTypes.func,
};

function mapStateToProps(state) {
  const gameData = state.gameCurrentView.get('gameData').toJS();
  const builds = state.gameCurrentView.get('builds').toJS();

  return { gameData, builds };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchBuilds: (championId, page) => {
      dispatch(fetchBuilds(championId, page, PAGESIZE));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GameCurrentView);
