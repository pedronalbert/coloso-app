import React, { PureComponent, PropTypes } from 'react';
import { View, Image } from 'react-native';

class ProfileImage extends PureComponent {
  render() {
    const url = `http://static.coloso.net/images/profileicons/${this.props.id}.jpg`;

    return <Image source={{ uri: url }} style={this.props.style} />;
  }
}

ProfileImage.propTypes = {
  id: PropTypes.number.isRequired,
  style: View.propTypes.style,
};

ProfileImage.defaultProps = {
  style: {
    width: 40,
    height: 40,
  },
};

export default ProfileImage;
