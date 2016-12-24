import React, { Component, PropTypes } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Modal from 'react-native-modalbox';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  root: {
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyRow: {
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
  },
  region: {
    width: 60,
    height: 30,
    backgroundColor: colors.primary,
    marginRight: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'white',
    borderRadius: 5,
  },
  summonerName: {
    fontSize: 16,
  },
});

function getMaxHeight() {
  return {
    maxHeight: Dimensions.get('window').height * 0.50,
  };
}

class HistoryModal extends Component {
  constructor(props) {
    super(props);

    this.handleOnPressHistoryEntry = this.handleOnPressHistoryEntry.bind(this);
  }

  open() {
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  handleOnPressHistoryEntry(summonerName, region) {
    this.props.onPressHistoryEntry(summonerName, region);
  }

  render() {
    return (<Modal
      ref={(modal) => { this.modal = modal; }}
      style={[styles.root, this.props.style, getMaxHeight()]}
      position="bottom"
    >
      <Text style={styles.title}>Busqueda rapida</Text>
      <ScrollView>
        {this.props.historyEntries.map((historyEntry, index) => <TouchableWithoutFeedback
          onPress={() => {
            this.handleOnPressHistoryEntry(historyEntry.summonerName, historyEntry.region);
          }}
          key={index}
        >
          <View style={styles.historyRow}>
            <Text style={styles.region}>{historyEntry.region.toUpperCase()}</Text>
            <Text style={styles.summonerName}>{historyEntry.summonerName}</Text>
          </View>
        </TouchableWithoutFeedback>)}
      </ScrollView>
    </Modal>);
  }
}

HistoryModal.defaultProps = {
  historyEntries: [],
};

HistoryModal.propTypes = {
  style: PropTypes.shape({}),
  historyEntries: PropTypes.arrayOf(PropTypes.shape({
    summonerName: PropTypes.string.isRequired,
    region: PropTypes.string.isRequired,
  })),
  onPressHistoryEntry: PropTypes.func.isRequired,
};

export default HistoryModal;