import React, {Component} from 'react';
import {Row, Col, Input, Table, ListGroup, ListGroupItem, Button, ButtonToolbar} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Utils from './utils/Functions';

import Attachment from './models/Attachment';
import SamplesFetcher from './fetchers/SamplesFetcher';

export default class Dataset extends Component {
  constructor(props) {
    super();
    let dataset = props.dataset.clone();
    this.state = {
      dataset: dataset
    };
  }

  handleInputChange(type, event) {
    const {dataset} = this.state;
    const {value} = event.target;
    switch(type) {
      case 'name':
        dataset.name = value;
        break;
      case 'instrument':
        dataset.instrument = value;
        break;
      case 'description':
        dataset.description = value;
        break;
    }
    this.setState({dataset});
  }

  handleFileDrop(files) {
    const {dataset} = this.state;

    let attachments = files.map(f => Attachment.fromFile(f));
    dataset.attachments = dataset.attachments.concat(attachments);

    this.setState({dataset});
  }

  handleAttachmentDownload(attachment) {
    if(attachment.preview) {
      Utils.downloadFile({contents: attachment.preview, name: attachment.name});
    }
    else {
      Utils.downloadFile({contents: `/api/v1/samples/download_attachement/${attachment.filename}/?filename=${attachment.name}`, name: attachment.name});
    }
  }

  handleAttachmentRemove(attachments) {
    const {dataset} = this.state;
    const index = dataset.attachments.indexOf(attachments);
    dataset.attachments.splice(index, 1);
    this.setState({dataset});
  }

  handleSave() {
    const {dataset} = this.state;
    const {onChange, onModalHide} = this.props;
    onChange(dataset);
    onModalHide();
  }

  attachments() {
    const {dataset} = this.state;
    if(dataset.attachments.length > 0) {
      return (
        <ListGroup>
        {dataset.attachments.map(attachment => {
          return (
            <ListGroupItem key={attachment.id}>
              <a onClick={() => this.handleAttachmentDownload(attachment)} style={{cursor: 'pointer'}}>{attachment.name}</a>
              <div className="pull-right">
                {this.removeAttachmentButton(attachment)}
              </div>
            </ListGroupItem>
          )
        })}
        </ListGroup>
      )
    } else {
      return (
        <div style={{padding: 5}}>
          There are currently no Datasets.<br/>
        </div>
      )
    }
  }

  removeAttachmentButton(attachment) {
    const {readOnly} = this.props;
    if(!readOnly) {
      return (
        <Button bsSize="xsmall" bsStyle="danger" onClick={() => this.handleAttachmentRemove(attachment)}>
          <i className="fa fa-trash-o"></i>
        </Button>
      );
    }
  }

  dropzone() {
    const {readOnly} = this.props;
    if(!readOnly) {
      return (
        <Dropzone
          onDrop={files => this.handleFileDrop(files)}
          style={{height: 50, width: '100%', border: '3px dashed lightgray'}}
          >
          <div style={{textAlign: 'center', paddingTop: 12, color: 'gray'}}>
            Drop Files, or Click to Select.
          </div>
        </Dropzone>
      );
    }
  }

  render() {
    const {dataset} = this.state;
    const {readOnly, onModalHide} = this.props;
    return (
      <Row>
        <Col md={6} style={{paddingRight: 0}}>
          <Col md={12} style={{padding: 0}}>
            <Input
              type="text"
              label="Name"
              value={dataset.name}
              disabled={readOnly}
              onChange={event => this.handleInputChange('name', event)}
              />
          </Col>
          <Col md={12} style={{padding: 0}}>
            <Input
              type="text"
              label="Instrument"
              value={dataset.instrument}
              disabled={readOnly}
              onChange={event => this.handleInputChange('instrument', event)}
              />
          </Col>
          <Col md={12} style={{padding: 0}}>
            <Input
              type="textarea"
              label="Description"
              value={dataset.description}
              disabled={readOnly}
              onChange={event => this.handleInputChange('description', event)}
              style={{minHeight: 100}}
              />
          </Col>
        </Col>
        <Col md={6}>
          <label>Attachments</label>
          {this.attachments()}
          {this.dropzone()}
        </Col>
        <Col md={12}>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => onModalHide()}>Close</Button>
            <Button bsStyle="warning" onClick={() => this.handleSave()}>Save</Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
}
