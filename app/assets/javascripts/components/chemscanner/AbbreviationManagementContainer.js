import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import ChemScannerFetcher from './ChemScannerFetcher';
import AbbreviationManagement from './AbbreviationManagement';

function RemoveRowBtn({ onClick, node }) {
  const col = node.columnApi.getColumn('abb');
  const headerName = col.colDef.headerName;
  const newAbb = headerName === 'Abbreviation' ? true : false;

  return (
    <Button
      active
      onClick={() => onClick(node.data, newAbb)}
      bsSize="xsmall"
    >
      <i className="fa fa-minus" />
    </Button>
  );
}

RemoveRowBtn.propTypes = {
  onClick: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default class AbbreviationManagementContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      abbreviations: [],
      superatoms: [],
      newAbb: true,
    };

    this.onGridReady = this.onGridReady.bind(this);
    this.changeTypeCreate = this.changeTypeCreate.bind(this);
    this.removeRow = this.removeRow.bind(this);
    this.createAbbreviation = this.createAbbreviation.bind(this);
  }

  componentDidMount() {
    ChemScannerFetcher.fetchAbbreviations().then((res) => {
      const { abbreviations, superatoms } = res;

      const abbData = Object.keys(abbreviations).map(k => (
        { abb: k, smi: abbreviations[k] }
      ));
      const superatomData = Object.keys(superatoms).map(satom => (
        { abb: satom, smi: superatoms[satom] }
      ));

      this.setState({
        abbreviations: abbData,
        superatoms: superatomData,
      });
    });
  }

  onGridReady(e, newAbb) {
    e.api.sizeColumnsToFit();

    if (newAbb) {
      this.abbGridApi = e.api;
    } else {
      this.superatomGridApi = e.api;
    }
  }

  changeTypeCreate() {
    const { newAbb } = this.state;
    this.setState({ newAbb: !newAbb });
  }

  removeRow(data, newAbb) {
    const gridApi = newAbb ? this.abbGridApi : this.superatomGridApi;

    ChemScannerFetcher.removeAbbreviation(data, newAbb).then((res) => {
      if (!res) return;

      const { abbreviations } = res;
      if (abbreviations.length === 0) return;

      const dataList = [];
      gridApi.forEachNode((rowNode) => {
        if (abbreviations.includes(rowNode.data.abb)) {
          dataList.push(rowNode.data);
        }
      });

      gridApi.updateRowData({ remove: dataList });
    });
  }

  createAbbreviation(abb, smiles, newAbb) {
    const gridApi = newAbb ? this.abbGridApi : this.superatomGridApi;
    if (!gridApi) return;

    ChemScannerFetcher.addAbbreviation(abb, smiles, newAbb).then((res) => {
      if (!res) return;

      const keys = Object.keys(res);
      if (keys.length === 0) return;

      const abbreviations = keys.map(k => ({ abb: k, smi: res[k] }));
      gridApi.updateRowData({
        add: abbreviations,
        addIndex: 0
      });
    });
  }

  render() {
    const { abbreviations, superatoms, newAbb } = this.state;

    const deleteCol = {
      headerName: '',
      field: 'type',
      editable: false,
      suppressFilter: true,
      cellRendererFramework: RemoveRowBtn,
      cellRendererParams: {
        onClick: this.removeRow
      },
      headerComponentParams: { headerName: '' }
    };

    const abbColumnDefs = [
      { ...deleteCol, width: 15 },
      { headerName: 'Abbreviation', field: 'abb', width: 120 },
      { headerName: 'SMILES', field: 'smi' },
    ];

    const superatomColumnDefs = [
      { ...deleteCol, width: 40 },
      { headerName: 'Superatom', field: 'abb', width: 120 },
      { headerName: 'SMILES', field: 'smi' },
    ];
    const defaultColDef = {
      enableValue: true
    };

    return (
      <AbbreviationManagement
        onGridReady={this.onGridReady}
        abbColumnDefs={abbColumnDefs}
        superatomColumnDefs={superatomColumnDefs}
        defaultColDef={defaultColDef}
        newAbb={newAbb}
        abbreviations={abbreviations}
        superatoms={superatoms}
        changeTypeCreate={this.changeTypeCreate}
        createAbbreviation={this.createAbbreviation}
      />
    );
  }
}
