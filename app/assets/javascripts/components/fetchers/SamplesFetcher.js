import 'whatwg-fetch';
import Sample from '../models/Sample';
import UIStore from '../stores/UIStore'
import NotificationActions from '../actions/NotificationActions'
import AttachmentFetcher from './AttachmentFetcher'
import _ from 'lodash';

import Container from '../models/Container';

export default class SamplesFetcher {
  static fetchByUIState(params) {
    let promise = fetch('/api/v1/samples/ui_state/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: {
          all: params.sample.all,
          included_ids: params.sample.included_ids,
          excluded_ids: params.sample.excluded_ids,
          collection_id: params.sample.collection_id
        }
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json.samples.map((s) => new Sample(s));
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static fetchById(id) {
    let promise = fetch('/api/v1/samples/' + id + '.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        return new Sample(json.sample);

      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchByCollectionId(id, queryParams={}, isSync = false, moleculeSort = false) {
    let page = queryParams.page || 1;
    let per_page = queryParams.per_page || UIStore.getState().number_of_results;
    let from_date = '';
    if (queryParams.fromDate) {
      from_date = `&from_date=${queryParams.fromDate.unix()}`
    }
    let to_date = '';
    if (queryParams.toDate) {
      to_date = `&to_date=${queryParams.toDate.unix()}`
    }
    const api = `/api/v1/samples.json?${isSync ? "sync_" : "" }` +
          `collection_id=${id}&page=${page}&per_page=${per_page}&` +
          `product_only=${queryParams.productOnly || false}` +
          `${from_date}${to_date}&` +
          `molecule_sort=${moleculeSort ? 1 : 0}`

    let promise = fetch(
      api,
      { credentials: 'same-origin' }
    ).then((response) => {
      return response.json().then((json) => {
        return {
          elements: json.molecules.map( m => {
            return m.samples.map( s => new Sample(s) )
          }),
          totalElements: parseInt(json.samples_count),
          page: parseInt(response.headers.get('X-Page')),
          pages: parseInt(response.headers.get('X-Total-Pages')),
          perPage: parseInt(response.headers.get('X-Per-Page'))
        }
      })
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static update(sample) {
    let files = AttachmentFetcher.getFileListfrom(sample.container)
    let promise = ()=> fetch('/api/v1/samples/' + sample.id, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sample.serialize())
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return new Sample(json.sample);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    if(files.length > 0) {
      return AttachmentFetcher.uploadFiles(files)().then(()=> promise());
    } else {
      return promise()
    }

  }

  static create(sample) {
    let files = AttachmentFetcher.getFileListfrom(sample.container)
    let promise = ()=> fetch('/api/v1/samples', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sample.serialize())
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return new Sample(json.sample);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });
    if(files.length > 0) {
      return AttachmentFetcher.uploadFiles(files)().then(()=> promise());
    } else {
      return promise()
    }
  }

  static deleteSamplesByUIState(params) {
    let promise = fetch('/api/v1/samples/ui_state/', {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: {
          all: params.sample.checkedAll,
          collection_id: params.currentCollection.id,
          is_sync: params.currentCollection.is_sync_to_me,
          included_ids: params.sample.checkedIds,
          excluded_ids: params.sample.uncheckedIds
        }
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static splitAsSubsamples(params) {
    let promise = fetch('/api/v1/samples/subsamples/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: {
          sample: {
            all: params.sample.checkedAll,
            included_ids: params.sample.checkedIds,
            excluded_ids: params.sample.uncheckedIds
          },
          currentCollectionId: params.currentCollection.id
        }
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static importSamplesFromFile(params) {

    var data = new FormData();
    data.append("file", params.file);
    data.append("currentCollectionId", params.currentCollectionId);

    let promise = fetch('/api/v1/samples/import/', {
      credentials: 'same-origin',
      method: 'post',
      body: data
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static importSamplesFromFileConfirm(params) {

    let promise = fetch('/api/v1/samples/confirm_import/', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentCollectionId: params.currentCollectionId,
        rows: params.rows,
        mapped_keys: params.mapped_keys,
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }
}
