import React, { Component } from 'react';
import { StudyViewPageStore } from 'pages/studyView/StudyViewPageStore';
import autobind from 'autobind-decorator';
import {
    ChartMeta,
    ChartMetaDataTypeEnum,
} from 'pages/studyView/StudyViewUtils';

interface Option {
    value: string;
    label: string;
}

interface ProfileOptions {
    [key: string]: Option[];
}

interface HomePageProps {
    store: StudyViewPageStore; // Assuming StudyViewPageStore is the type of your store
}

interface HomePageState {
    selectedOption: string | null;
    entityNames: string[];
}

class HomePage extends Component<HomePageProps, HomePageState> {
    constructor(props: HomePageProps) {
        super(props);
        this.state = {
            selectedOption: null,
            entityNames: [],
        };
    }

    @autobind
    handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const selectedValue = event.target.value;
        this.setState({ selectedOption: selectedValue });

        const { store } = this.props;

        const entities = store.genericAssayEntitiesGroupedByProfileId.result;
        if (entities && entities[selectedValue]) {
            const entityArray = entities[selectedValue];
            const names = entityArray.map(entity => entity.stableId);
            this.setState({ entityNames: names });
        } else {
            this.setState({ entityNames: [] });
        }
    }

    async componentDidMount() {
        const { store } = this.props;
        const chartMeta: ChartMeta = {
            dataType: ChartMetaDataTypeEnum.GENERIC_ASSAY,
            description: 'Cell growth phase assignments',
            displayName: 'G2M: Single cell - cell cycle phase values',
            genericAssayType: 'SINGLE_CELL_CYCLE_PHASES',
            patientAttribute: false,
            priority: 0,
            renderWhenDataChange: false,
            uniqueKey: 'G2M_single_cell_cycle_phases',
        };

        try {
            const resp = await store.getGenericAssayChartDataBin(chartMeta);
            console.log(resp.result, 'here are responses');
            console.log(store, 'here is store');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    render() {
        const { store } = this.props;
        const { selectedOption, entityNames } = this.state;

        return (
            <div>
                <h2>Select an Option:</h2>
                <select
                    onChange={this.handleSelectChange}
                    value={selectedOption || ''}
                >
                    <option value="">Select...</option>
                    {Object.keys(
                        store.genericAssayProfileOptionsByType.result
                    ).map(type =>
                        store.genericAssayProfileOptionsByType.result[
                            type as keyof ProfileOptions
                        ].map(option => (
                            <option
                                key={option.value}
                                value={option.profileIds[0]}
                            >
                                {option.label}
                            </option>
                        ))
                    )}
                </select>

                {/* Display entity names */}
                {entityNames.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h2>Entities:</h2>
                        <ul>
                            {entityNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default HomePage;
