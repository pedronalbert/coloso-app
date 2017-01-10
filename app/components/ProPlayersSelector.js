import React, { Component, PropTypes } from 'react';
import { View, Text, Picker } from 'react-native';
import { MediaQueryStyleSheet } from 'react-native-responsive';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';

const styles = MediaQueryStyleSheet.create(
  {
    root: {
      flexDirection: 'row',
    },
    titleText: {
      alignSelf: 'center',
      fontWeight: 'bold',
    },
    picker: {
      flex: 1,
    },
  },
  {
    '@media (min-device-width: 600)': {
      picker: {
        height: 50,
      },
    },
  },
);

class ChampionSelector extends Component {
  constructor(props) {
    super(props);

    this.handleOnValueChange = this.handleOnValueChange.bind(this);
    this.state = {
      selectedValue: 0,
    };
  }

  componentWillMount() {
    this.setState({ selectedValue: this.props.initialValue });
  }

  handleOnValueChange(newValue) {
    if (!this.props.disabled) {
      this.props.onChangeSelected(newValue);
      this.setState({ selectedValue: newValue });
    }
  }

  render() {
    let pickerOptions = [
      Immutable.Map({ name: 'Seleccionar Jugador', value: 0 }),
    ];

    pickerOptions = pickerOptions.concat(this.props.proPlayers.toArray());

    return (<View style={[styles.root, this.props.style]}>
      <Text style={[styles.titleText, this.props.titleStyle]}>Jugador: </Text>
      <Picker
        style={[styles.picker]}
        selectedValue={this.state.selectedValue}
        onValueChange={this.handleOnValueChange}
        enabled={!this.props.disabled}
      >
        {pickerOptions.map((player, index) => <Picker.Item
          key={index}
          label={player.get('name')}
          value={player.get('id')}
        />)}
      </Picker>
    </View>);
  }
}

ChampionSelector.propTypes = {
  onChangeSelected: PropTypes.func.isRequired,
  initialValue: PropTypes.number,
  disabled: PropTypes.bool,
  style: View.propTypes.style,
  titleStyle: Text.propTypes.style,
  proPlayers: ImmutablePropTypes.listOf(ImmutablePropTypes.mapContains({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

ChampionSelector.defaultProps = {
  initialValue: 0,
  disabled: false,
};

export default ChampionSelector;