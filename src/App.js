/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

import React from 'react';
import {FlexColumn, FlexRow} from 'flipper';
import {connect} from 'react-redux';
import WelcomeScreen from './chrome/WelcomeScreen.js';
import TitleBar from './chrome/TitleBar.js';
import MainSidebar from './chrome/MainSidebar.js';
import BugReporterDialog from './chrome/BugReporterDialog.js';
import ErrorBar from './chrome/ErrorBar.js';
import PluginContainer from './PluginContainer.js';
import Sheet from './chrome/Sheet.js';
import {ipcRenderer} from 'electron';

import type Logger from './fb-stubs/Logger.js';
import type BugReporter from './fb-stubs/BugReporter.js';
import type BaseDevice from './devices/BaseDevice.js';

type Props = {
  logger: Logger,
  bugReporter: BugReporter,
  leftSidebarVisible: boolean,
  pluginManagerVisible: boolean,
  selectedDevice: ?BaseDevice,
  error: ?string,
};

export class App extends React.Component<Props> {
  componentDidMount() {
    // track time since launch
    const [s, ns] = process.hrtime();
    const launchEndTime = s * 1e3 + ns / 1e6;
    ipcRenderer.on('getLaunchTime', (event, launchStartTime) => {
      this.props.logger.track(
        'performance',
        'launchTime',
        launchEndTime - launchStartTime,
      );
    });
    ipcRenderer.send('getLaunchTime');
    ipcRenderer.send('componentDidMount');
  }
  render() {
    return (
      <FlexColumn grow={true}>
        <TitleBar />
        <Sheet>
          {onHide => (
            <BugReporterDialog
              bugReporter={this.props.bugReporter}
              onHide={onHide}
            />
          )}
        </Sheet>
        <FlexRow grow={true}>
          {this.props.leftSidebarVisible && <MainSidebar />}
          {this.props.selectedDevice ? (
            <PluginContainer logger={this.props.logger} />
          ) : (
            <WelcomeScreen />
          )}
        </FlexRow>
        <ErrorBar text={this.props.error} />
      </FlexColumn>
    );
  }
}
/* $FlowFixMe(>=0.86.0) This
 * comment suppresses an error found when Flow v0.86 was
 * deployed. To see the error, delete this comment and
 * run Flow. */
export default connect(
  ({
    application: {pluginManagerVisible, leftSidebarVisible},
    connections: {selectedDevice, error},
  }) => ({
    pluginManagerVisible,
    leftSidebarVisible,
    selectedDevice,
    error,
  }),
)(App);