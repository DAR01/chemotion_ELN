import alt from '../alt';
import InboxFetcher from '../fetchers/InboxFetcher';
import AttachmentFetcher from '../fetchers/AttachmentFetcher'
import ContainerFetcher from '../fetchers/ContainerFetcher'

class InboxActions{

  fetchInbox() {
    return (dispatch) => { InboxFetcher.fetchInbox()
      .then((result) => {
        dispatch(result.inbox);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });};
  }

  removeAttachmentFromList(attachment){
    return attachment;
  }

  removeUnlinkedAttachmentFromList(attachment){
    return attachment;
  }

  removeDatasetFromList(dataset){
    return dataset;
  }

  deleteAttachment(params) {
    return (dispatch) => { AttachmentFetcher.deleteAttachment(params)
      .then((result) => {
        dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });};
  }

  deleteContainerLink(params) {
    return (dispatch) => { AttachmentFetcher.deleteContainerLink(params)
      .then((result) => {
        dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });};
  }

  deleteContainer(params) {
    return (dispatch) => { ContainerFetcher.deleteContainer(params)
      .then((result) => {
        dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });};
  }

  backToInbox(attachment){
    return attachment
  }

}

export default alt.createActions(InboxActions);
