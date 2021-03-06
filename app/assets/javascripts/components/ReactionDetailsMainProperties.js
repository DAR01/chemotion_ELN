import React, {Component} from 'react';
import {
  Row, Col, FormGroup, FormControl, ControlLabel, Table,
  OverlayTrigger, Button, Tooltip, InputGroup, Checkbox
} from 'react-bootstrap'
import Select from 'react-select'

import Reaction from './models/Reaction';

import { statusOptions } from './staticDropdownOptions/options'

import LineChartContainer from './lineChart/LineChartContainer'
import EditableTable from './lineChart/EditableTable'

export default class ReactionDetailsMainProperties extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showTemperatureChart: false,
      temperature: props.reaction.temperature
    }

    this.toggleTemperatureChart = this.toggleTemperatureChart.bind(this);
    this.updateTemperature = this.updateTemperature.bind(this);

    this.temperatureUnit = props.reaction.temperature.valueUnit;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      temperature: nextProps.reaction.temperature,
    });

    this.temperatureUnit = nextProps.reaction.temperature.valueUnit;
  }

  updateTemperature(newData) {
    let {temperature} = this.state
    temperature.data = newData

    this.setState({temperature: temperature})

    this.props.onInputChange('temperatureData', temperature)
  }

  toggleTemperatureChart() {
    let {showTemperatureChart} = this.state
    this.setState({ showTemperatureChart: !showTemperatureChart })
  }

  changeUnit() {
    let index = Reaction.temperature_unit.indexOf(this.temperatureUnit)
    let unit = Reaction.temperature_unit[(index + 1) % 3]

    this.props.onInputChange('temperatureUnit', unit)
  }

  render() {
    const { reaction, onInputChange } = this.props;
    const temperatureTooltip = (
      <Tooltip id="show_temperature">Show temperature chart</Tooltip>
    );

    const temperatureDisplay = reaction.temperature_display;
    const { showTemperatureChart, temperature } = this.state;
    const tempUnitLabel = `Temperature (${this.temperatureUnit})`;

    let TempChartRow = <span />;
    if (showTemperatureChart) {
      TempChartRow = (
        <div>
          <div style={{ width: '74%', float: 'left' }}>
            <LineChartContainer
              data={temperature}
              xAxis="Time"
              yAxis={tempUnitLabel}
            />
          </div>
          <div style={{ width: '25%', float: 'left' }}>
            <EditableTable
              temperature={temperature}
              updateTemperature={this.updateTemperature}
            />
          </div>
        </div>
      );
    }

    return (
      <Table>
        <tbody>
          <tr>
            <Col md={6}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  type="text"
                  value={reaction.name || ''}
                  placeholder="Name..."
                  disabled={reaction.isMethodDisabled('name')}
                  onChange={event => onInputChange('name', event)}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <ControlLabel>Status</ControlLabel>
                <Select
                  name="status"
                  multi={false}
                  options={statusOptions}
                  value={reaction.status}
                  disabled={reaction.isMethodDisabled('status')}
                  onChange={(event) => {
                    const wrappedEvent = {
                      target: { value: event && event.value },
                    };
                    onInputChange('status', wrappedEvent);
                  }}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <ControlLabel>Temperature</ControlLabel>
                <InputGroup>
                  <InputGroup.Button>
                    <OverlayTrigger placement="bottom" overlay={temperatureTooltip}>
                      <Button
                        active
                        className="clipboardBtn"
                        onClick={this.toggleTemperatureChart}
                      >
                        <i className="fa fa-area-chart" />
                      </Button>
                    </OverlayTrigger>
                  </InputGroup.Button>
                  <FormControl
                    type="text"
                    value={temperatureDisplay || ''}
                    disabled={reaction.isMethodDisabled('temperature')}
                    placeholder="Temperature..."
                    onChange={event => onInputChange('temperature', event)}
                  />
                  <InputGroup.Button>
                    <Button
                      bsStyle="success"
                      onClick={() => this.changeUnit()}
                    >
                      {this.temperatureUnit}
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </Col>
          </tr>
          <tr>
            {TempChartRow}
          </tr>
        </tbody>
      </Table>
    );
  }
}

ReactionDetailsMainProperties.propTypes = {
  reaction: React.PropTypes.object,
  onInputChange: React.PropTypes.func
}
