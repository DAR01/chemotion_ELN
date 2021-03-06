import React, { Component } from 'react';
import StickyDiv from 'react-stickydiv';
import { Tabs, Tab, Label } from 'react-bootstrap';
import SampleDetails from './SampleDetails';
import DeviceDetails from './DeviceDetails';
import ReactionDetails from './ReactionDetails';
import WellplateDetails from './WellplateDetails';
import ScreenDetails from './ScreenDetails';
import ResearchPlanDetails from './ResearchPlanDetails';
import { ConfirmModal } from './common/ConfirmModal';
import ReportContainer from './report/ReportContainer';
import FormatContainer from './FormatContainer';
import GraphContainer from './computed_props/GraphContainer';
import DetailActions from './actions/DetailActions';
import ElementStore from './stores/ElementStore';
import { SameEleTypId } from './utils/ElementUtils';

export default class ElementDetails extends Component {
  constructor(props) {
    super(props);
    const { selecteds, activeKey, deletingElement } = ElementStore.getState();
    this.state = {
      offsetTop: 70,
      fullScreen: false,
      selecteds,
      activeKey,
      deletingElement,
    };

    this.handleResize = this.handleResize.bind(this);
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
    this.onDetailChange = this.onDetailChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    window.scrollTo(window.scrollX, window.scrollY + 1);
    // imitate scroll event to make StickyDiv element visible in current area
    ElementStore.listen(this.onDetailChange);
    if (this.props.currentElement !== null) {
      DetailActions.changeCurrentElement.defer(null, this.props.currentElement);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!SameEleTypId(this.props.currentElement, nextProps.currentElement)) {
      DetailActions.changeCurrentElement.defer(this.props.currentElement, nextProps.currentElement);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    return true;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    ElementStore.unlisten(this.onDetailChange);
  }

  onDetailChange(state) {
    const { selecteds, activeKey, deletingElement } = state;
    this.setState(prevState => ({ ...prevState, selecteds, activeKey, deletingElement }));
  }

  toggleFullScreen() {
    const { fullScreen } = this.state;
    this.setState({ fullScreen: !fullScreen });
  }

  handleResize() {
    const windowHeight = window.innerHeight || 1;
    if (this.state.fullScreen || windowHeight < 500) {
      this.setState({ offsetTop: 0 });
    } else {
      this.setState({ offsetTop: 70 });
    }
  }

  content(el) {
    switch (el.type) {
      case 'sample':
        return (
          <SampleDetails
            sample={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      case 'reaction':
        return (
          <ReactionDetails
            reaction={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      case 'wellplate':
        return (
          <WellplateDetails
            wellplate={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      case 'screen':
        return (
          <ScreenDetails
            screen={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      case 'deviceCtrl':
        return (
          <DeviceDetails
            device={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      // case 'deviceAnalysis':
      //   return <DeviceAnalysisDetails analysis={el}
      //     toggleFullScreen={this.toggleFullScreen}/>;
      case 'research_plan':
        return (
          <ResearchPlanDetails
            research_plan={el}
            toggleFullScreen={this.toggleFullScreen}
          />
        );
      case 'report':
        return <ReportContainer report={el} />;
      case 'format':
        return <FormatContainer format={el} />;
      case 'graph':
        return <GraphContainer graph={el} />;
      default:
        return (<span />);
    }
  }

  tabTitle(el, elKey) {
    let bsStyle = el.isPendingToSave ? 'info' : 'primary';
    const focusing = elKey === this.state.activeKey;

    let iconElement = (<i className={`icon-${el.type}`} />);
    let title = el.title();

    if (el.type === 'report') {
      title = 'Report';
      bsStyle = 'primary';
      iconElement = (
        <span>
          <i className="fa fa-file-text-o" />&nbsp;&nbsp;
          <i className="fa fa-pencil" />
        </span>
      );
    } else if (el.type === 'deviceCtrl') {
      title = 'Measurement';
      bsStyle = 'primary';
      iconElement = (
        <span>
          <i className="fa fa-bar-chart" />
          <i className="fa fa-cogs" />
        </span>
      );
    } else if (el.type === 'format') {
      title = "Format";
      bsStyle = "primary";
      iconElement = (
        <span>
          <i className="fa fa-magic" />
        </span>
      );
    } else if (el.type === 'graph') {
      title = 'Graph';
      bsStyle = 'primary';
      iconElement = (
        <span>
          <i className="fa fa-area-chart" />
        </span>
      );
    }

    const icon = focusing ? (iconElement) : (<Label bsStyle={bsStyle}>{iconElement}</Label>);

    return (<div>{icon} &nbsp; {title} </div>);
  }

  confirmDeleteContent() {
    return (
      <div>
        <p>Unsaved data will be lost.</p>
      </div>
    );
  }

  render() {
    const {
      fullScreen, selecteds, activeKey, offsetTop, deletingElement
    } = this.state;
    const fScrnClass = fullScreen ? 'full-screen' : 'normal-screen';

    const selectedElements = selecteds.map((el, i) => {
      if (!el) return (<span />);
      const key = `${el.type}-${el.id}`;
      return (
        <Tab
          key={key}
          eventKey={i}
          unmountOnExit
          title={this.tabTitle(el, i)}
        >
          {this.content(el)}
        </Tab>
      );
    });

    return (
      <div>
        <StickyDiv zIndex={fullScreen ? 9 : 2} offsetTop={offsetTop}>
          <div className={fScrnClass}>
            <Tabs
              id="elements-tabs"
              activeKey={activeKey}
              onSelect={DetailActions.select}
            >
              {selectedElements}
            </Tabs>
          </div>
        </StickyDiv>
        <ConfirmModal
          showModal={deletingElement !== null}
          title="Confirm Close"
          content={this.confirmDeleteContent()}
          onClick={DetailActions.confirmDelete}
        />
      </div>
    );
  }
}

// ElementDetails.propTypes = {
//   currentElement: React.PropTypes.shape.isRequired
// };
