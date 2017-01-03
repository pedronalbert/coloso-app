import React, { PureComponent, PropTypes } from 'react';
import Drawer from 'react-native-drawer';
import { Actions, DefaultRenderer } from 'react-native-router-flux';
import SideMenu from './SideMenu';


class MainDrawer extends PureComponent {
  render() {
    const state = this.props.navigationState;
    const children = state.children;
    return (<Drawer
      styles={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      open={state.open}
      onOpen={() => Actions.refresh({ key: state.key, open: true })}
      onClose={() => Actions.refresh({ key: state.key, open: false })}
      type="overlay"
      content={<SideMenu />}
      tapToClose
      openDrawerOffset={0.2}
      panCloseMask={0.2}
      negotiatePan
    >
      <DefaultRenderer navigationState={children[0]} onNavigate={this.props.onNavigate} />
    </Drawer>);
  }
}

MainDrawer.propTypes = {
  navigationState: PropTypes.shape({}),
  onNavigate: PropTypes.func,
};

export default MainDrawer;