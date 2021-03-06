import React, { PureComponent, PropTypes } from 'react';
import { View, ScrollView } from 'react-native';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';

import { ErrorScreen, LoadingIndicator, BannedChampions } from 'components';
import TeamHeader from './TeamHeader';
import Participant from './Participant';

class Matchtab extends PureComponent {
  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !Immutable.is(nextProps.game, this.props.game);
  }

  getTeam(teamId) {
    const teamsDataList = this.props.game.getIn(['data', 'teams']);

    return teamsDataList.find(team => team.get('teamId') === teamId);
  }

  getParticipants(teamId) {
    const participantsList = this.props.game.getIn(['data', 'participants']);

    return participantsList.filter(participant => participant.get('teamId') === teamId);
  }

  renderContent() {
    const blueTeam = this.getTeam(100);
    const redTeam = this.getTeam(200);
    const blueParticipants = this.getParticipants(100);
    const redParticipants = this.getParticipants(200);

    return (<ScrollView keyboardShouldPersistTaps="handled">
      <TeamHeader team={blueTeam} participants={blueParticipants} />
      <BannedChampions champions={blueTeam.get('bans')} />
      {blueParticipants.map(participant => <Participant
        key={participant.get('participantId')}
        participant={participant}
        onPressParticipant={this.props.onPressParticipant}
      />)}
      <TeamHeader team={redTeam} participants={redParticipants} />
      <BannedChampions champions={redTeam.get('bans')} />
      {redParticipants.map(participant => <Participant
        key={participant.get('participantId')}
        participant={participant}
        onPressParticipant={this.props.onPressParticipant}
      />)}
    </ScrollView>);
  }

  render() {
    const game = this.props.game;

    if (game.get('isFetching')) {
      return (<View style={{ padding: 16, alignItems: 'center' }}>
        <LoadingIndicator />
      </View>);
    } else if (game.get('fetchError')) {
      return (<ErrorScreen
        message={game.get('errorMessage')}
        onPressRetryButton={this.props.onPressRetryButton}
      />);
    } else if (game.get('fetched')) {
      return this.renderContent();
    }

    return null;
  }
}

Matchtab.propTypes = {
  game: ImmutablePropTypes.mapContains({
    fetched: PropTypes.bool.isRequired,
    fetchError: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    data: ImmutablePropTypes.mapContains({}),
  }).isRequired,
  onPressRetryButton: PropTypes.func.isRequired,
  onPressParticipant: PropTypes.func.isRequired,
};

export default Matchtab;
