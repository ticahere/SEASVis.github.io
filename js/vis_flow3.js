/* * * * * * * * * * * * * *
*      class visFlow     *
* * * * * * * * * * * * * */

class visFlow {

    constructor(parentElement, dataPeople, dataCenters){
        this.parentElement = parentElement;
        this.dataPeople = dataPeople;
        this.dataCenters = dataCenters;

        this.initVis()
    }

    reset(){
        let vis = this;
        vis.Nodes.forEach(function(d){
            d3.select("#" + d.id).classed("repressNode", false);
        })

        vis.Links.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
    }

    repress(stat){
        let vis = this;
        vis.Nodes.forEach(function(d){
            d3.select("#" + d.id).classed("repressNode", stat);
        })

        vis.Links.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", stat);
        })
    }

    mouse_action(val, stat, lvl){
        let vis = this;

        if(lvl === 0){
            let area0 = vis.Nodes.filter(obj => {return obj.name === val.name})[0];
            let areaFaculty = [];
            d3.select("#" + area0.id).classed("repressNode", false);

            vis.Links.forEach(function(d){
                if(d.target.id === area0.id){
                    d3.select("#" + d.id).classed("repressLink", false);
                    d3.select("#" + d.id).classed("activeLink", stat);
                    areaFaculty.push(d.source);
                    d3.select("#" + d.source.id).classed("repressNode", false);
                    d3.select("#" + d.source.id).classed("activeFaculty", stat);
                }
            })

            vis.Links.forEach(function(d){
                if(d.lvl === 1){
                    if(areaFaculty.includes(d.source)){
                        d3.select("#" + d.id).classed("repressLink", false);
                        d3.select("#" + d.id).classed("activeLink", stat);
                        d3.select("#" + d.target.id).classed("repressNode", false);
                    }
                }
            })
        }

        if(lvl === 1){
            d3.select("#" + val.id).classed("repressNode", false);
            d3.select("#" + val.id).classed("activeFaculty", stat);

            vis.Links.forEach(function(d){
                if(d.source.id === val.id){
                    d3.select("#" + d.id).classed("repressLink", false);
                    d3.select("#" + d.id).classed("activeLink", stat);
                    d3.select("#" + d.target.id).classed("repressNode", false);
                }
            })
        }

        if(lvl === 2){
            let centerFaculty = [];
            d3.select("#" + val.id).classed("repressNode", false);

            vis.Links.forEach(function(d){
                if(d.target.id === val.id){
                    d3.select("#" + d.id).classed("repressLink", false);
                    d3.select("#" + d.id).classed("activeLink", stat);
                    centerFaculty.push(d.source);
                    d3.select("#" + d.source.id).classed("repressNode", false);
                    d3.select("#" + d.source.id).classed("activeFaculty", stat);
                }
            })

            vis.Links.forEach(function(d){
                if(d.lvl === 0){
                    if(centerFaculty.includes(d.source)){
                        d3.select("#" + d.id).classed("repressLink", false);
                        d3.select("#" + d.id).classed("activeLink", stat);
                        d3.select("#" + d.target.id).classed("repressNode", false);
                    }
                }
            })
        }
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 20, bottom: 20, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", 2000)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("rect")
            .attr("width", vis.width)
            .attr("height", 2000)
            .style("fill", "white")
            .on("click", function () {
                vis.repress(false);
            });

        document.addEventListener('scroll', function() {
            vis.updateVis()
        });

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.Nodes = [];
        vis.Links = [];

        vis.filteredData = [];
        vis.listFaculty = [];
        vis.listAreas = [];
        vis.listCenters = [];

        vis.dataPeople.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');
            let researchInterests = faculty['Research Interests'].split('|');

            if(teachingAreas.length === 1 && teachingAreas[0] === ""){return;}
            if(researchInterests.length === 1 && researchInterests[0] === ""){return;}

            vis.filteredData.push(faculty);
            vis.listFaculty.push(title);
        });

        vis.filteredData.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');

            vis.Nodes.push({
                "lvl": 1,
                "name": title,
                "school": 1
            })

            teachingAreas.forEach(function(area){
                if(!vis.listAreas.includes(area)){
                    vis.listAreas.push(area);
                    vis.Nodes.push({
                        "lvl": 0,
                        "name": area,
                        "school": 1
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": area,
                    "lvl": 0
                })
            })
        });

        let countSchool = 0;
        vis.dataCenters.forEach(function(row, index){
            let title = row['Title'];
            let center = row['Center'];

            if(!vis.listFaculty.includes(title)){return;}

            if(!vis.listCenters.includes(center)) {
                vis.listCenters.push(center);

                if(countSchool < 7){
                    vis.Nodes.push({
                        "lvl": 2,
                        "name": center,
                        "school": 0
                    })
                } else {
                    vis.Nodes.push({
                        "lvl": 2,
                        "name": center,
                        "school": 1
                    })
                }
                countSchool += 1;
            }

            vis.Links.push({
                "source": title,
                "target": center,
                "lvl": 1
            })
        });

        let selectDiv = document.getElementById('center-filter-selector');
        vis.listCenters.forEach((center) => {
            let opt = document.createElement('option');
            opt.value = center;
            opt.innerHTML = center;
            selectDiv.appendChild(opt);
        });
        $('#center-filter-selector').selectpicker('refresh');

        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl && a.lvl !== 2){
                return a.name.localeCompare(b.name);
            }
            return a.lvl - b.lvl;
        });

        vis.listAreas.sort(function(a,b){ return a.localeCompare(b) });
        vis.listFaculty.sort(function(a,b){ return a.localeCompare(b) });

        vis.colors = ["#ed1b34", "#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca"]
        vis.colors2 = ["#808080", "#696969"]
        vis.colorAreas = d3.scaleOrdinal().domain(vis.listAreas).range(vis.colors)

        vis.areaCount = vis.listAreas.length;
        vis.facultyCount = vis.listFaculty.length;
        vis.centerCount = vis.listCenters.length;

        vis.Nodes.forEach(function (d, i) {
            d.id = "n" + i;
        });
        vis.Links.forEach(function (d) {
            d.source = vis.Nodes.filter(obj => {return obj.name === d.source})[0];
            d.target = vis.Nodes.filter(obj => {return obj.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.allNodes = vis.Nodes;
        vis.allLinks = vis.Links;

        vis.updateVis();
    }

    filterData(){
        let vis = this;

        vis.Nodes = vis.allNodes;
        vis.Links = vis.allLinks;
        vis.reset();

        if(selectedArea.length === 0 && selectedCenter.length === 0){
            vis.Nodes = [];
            vis.Links = [];
        }

        if(selectedArea[0] !== "Include All" && selectedCenter.length !== 0) {
            let selectedNodes = [];
            let selectedLinks = [];
            let selectedAreas = [];
            let selectedFaculty = [];

            selectedArea.forEach(function (d) {
                let tempNode = vis.Nodes.filter(obj => {
                    return obj.name === d
                })[0];

                selectedNodes.push(tempNode);
                selectedAreas.push(tempNode);
            })
            selectedAreas.forEach(function (area) {
                vis.Links.forEach(function (d) {
                    if (d.target.id === area.id) {
                        if (!selectedLinks.includes(d)) {
                            selectedLinks.push(d)
                        }

                        let tempSelected = vis.Nodes.filter(obj => {
                            return obj.name === d.source.name
                        })[0]
                        if (!selectedNodes.includes(tempSelected)) {
                            selectedNodes.push(tempSelected);
                        }
                        selectedFaculty.push(d.source);
                    }
                })

                vis.Links.forEach(function (d) {
                    if (d.lvl === 1) {
                        if (selectedFaculty.includes(d.source)) {
                            if (!selectedLinks.includes(d)) {
                                selectedLinks.push(d)
                            }

                            let tempSelected = vis.Nodes.filter(obj => {
                                return obj.name === d.target.name
                            })[0]
                            if (!selectedNodes.includes(tempSelected)) {
                                selectedNodes.push(tempSelected);
                            }
                        }
                    }
                })
            })

            selectedNodes.sort((a,b) => a.lvl - b.lvl || a.school - b.school || d3.ascending(a.name, b.name))
            vis.Nodes = selectedNodes;
            vis.Links = selectedLinks;
            console.log(vis.Nodes)
        }

        if(selectedCenter[0] !== "Include All" && selectedArea.length !== 0) {
            let selectedNodes = [];
            let selectedLinks = [];
            let selectedCenters = [];
            let selectedFaculty = [];

            selectedCenter.forEach(function (d) {
                let tempNode = vis.Nodes.filter(obj => {
                    return obj.name === d
                })[0];

                selectedNodes.push(tempNode);
                selectedCenters.push(tempNode);
            })

            selectedCenters.forEach(function (center) {
                vis.Links.forEach(function (d) {
                    if (d.target.id === center.id) {
                        if (!selectedLinks.includes(d)) {
                            selectedLinks.push(d)
                        }

                        let tempSelected = vis.Nodes.filter(obj => {
                            return obj.name === d.source.name
                        })[0]
                        if (!selectedNodes.includes(tempSelected)) {
                            selectedNodes.push(tempSelected);
                        }
                        selectedFaculty.push(d.source);
                    }
                })

                vis.Links.forEach(function (d) {
                    if (d.lvl === 0) {
                        if (selectedFaculty.includes(d.source)) {
                            if (!selectedLinks.includes(d)) {
                                selectedLinks.push(d)
                            }

                            let tempSelected = vis.Nodes.filter(obj => {
                                return obj.name === d.target.name
                            })[0]
                            if (!selectedNodes.includes(tempSelected)) {
                                selectedNodes.push(tempSelected);
                            }
                        }
                    }
                })
            })

            selectedNodes.sort((a,b) => a.lvl - b.lvl || a.area - b.area || d3.ascending(a.name, b.name))
            vis.Nodes = selectedNodes;
            vis.Links = selectedLinks;
        }

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        let count = [];
        vis.Nodes.forEach(function (d) {
            count[d.lvl] = 0;
        });
        vis.lvlCount = 3;
        let countNodesAreas = vis.Nodes.filter((obj) => obj.lvl === 0).length;
        let countNodesFaculty = vis.Nodes.filter((obj) => obj.lvl === 1).length;
        let countNodesCenters = vis.Nodes.filter((obj) => obj.lvl === 2).length;

        vis.boxWidth = 155;
        vis.boxWidthArea = 240;
        vis.boxWidthCenter = 340;
        vis.gap = {width: (vis.width - (vis.boxWidthArea + vis.boxWidth + vis.boxWidthCenter)) / (vis.lvlCount-1), height: 2};

        vis.boxHeight = 14;
        vis.boxHeightArea = (vis.height - countNodesAreas*vis.gap.height) / countNodesAreas;
        vis.boxHeightCenter = (vis.height - (countNodesCenters+1)*vis.gap.height) / (countNodesCenters+1);
        vis.schoolOffset = vis.boxHeightCenter;

        let listSchools = [
            "Harvard Business School",
            "Harvard Graduate School of Design",
            "Harvard Kennedy School of Government",
            "Harvard Law School",
            "Harvard Medical School",
            "Harvard T.H. Chan School of Public Health",
            "Institute for Applied Computational Science (IACS)"
        ]
        let countSelectedSchools = 0;
        vis.Nodes.forEach(function(d){
            if(listSchools.includes(d.name)){
                countSelectedSchools += 1;
            }
        })

        vis.schoolCount = 0;
        vis.Nodes.forEach(function (d, i) {
            if(d.lvl === 0) {
                d.x = 0;
                d.y = (vis.boxHeightArea + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                count[d.lvl] += 1;
            } else if(d.lvl === 2){
                d.x = vis.boxWidthArea + vis.boxWidth + d.lvl*vis.gap.width;

                if(countSelectedSchools === 0){
                    d.y = (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                    vis.schoolCount = vis.schoolCount + 1;
                } else {
                    if(vis.schoolCount < countSelectedSchools){
                        d.y = (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                        vis.schoolCount = vis.schoolCount + 1;
                    }
                    else{
                        d.y = vis.schoolOffset + (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                    }
                }

                count[d.lvl] += 1;
            } else { //(d.lvl === 1)
                d.x = vis.boxWidthArea + vis.gap.width;
                d.y = (vis.boxHeight + vis.gap.height) * count[d.lvl];
                count[d.lvl] += 1;
            }
        });

        let nodes = vis.svg.selectAll(".node").data(vis.Nodes, d=>d.id)
        nodes.exit().remove();

        let listSelectedCenters = vis.Nodes.filter((d) => d.lvl === 2).map(function(d){return d.name});
        vis.colorCenters = d3.scaleOrdinal().domain(listSelectedCenters).range(vis.colors2)
        let nodesEnter = nodes.enter().append("rect")
            .attr("class", "node")
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.lvl === 0){ return vis.boxWidthArea; }
                if(d.lvl === 2){ return vis.boxWidthCenter; }
                else{ return vis.boxWidth; }
            })
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.repress(true);
                vis.mouse_action(d3.select(this).datum(), true, d3.select(this).datum().lvl);
            });

        nodes.merge(nodesEnter)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("height", function(d) {
                if(d.lvl === 0){ return vis.boxHeightArea; }
                if(d.lvl === 2){ return vis.boxHeightCenter; }
                else{ return vis.boxHeight; }
            })
            .attr("fill", function(d){
                if(d.lvl === 0){ return vis.colorAreas(d.name); }
                else if(d.lvl === 2){ return vis.colorCenters(d.name); }
                else{ return "#ed1b34"; }
            })

        let labels = vis.svg.selectAll(".label").data(vis.Nodes, d=>d.name)
        labels.exit().remove();

        let labelsEnter = labels.enter().append("text")
            .attr("class", "label")
            .style("font-size", "10px")
            .text(function (d) {
                return d.name;
                // if(d.name !== "Environmental Science & Engineering" && d.name !== "Materials Science & Mechanical Engineering"){
                //     return d.name;
                // }
            });

        labels.merge(labelsEnter)
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) {
                if(d.lvl === 0){
                    return d.y + vis.boxHeightArea/2+3;
                }else if(d.lvl === 2){
                    return d.y + vis.boxHeightCenter/2+3;
                }else{
                    return d.y + vis.boxHeight-2;
                }
            })

        // let offset_wrap = 7
        // vis.nodes_ESE = vis.Nodes.filter(obj => {
        //     return obj.name === "Environmental Science & Engineering"
        // })
        // if(vis.nodes_ESE.length > 0){
        //
        //     let ESE1 = vis.nodes_ESE[0]
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", ESE1.x + 7 )
        //         .attr("y", ESE1.y + vis.boxHeightArea/2+3 - offset_wrap)
        //         .style("font-size", "10px")
        //         .text("Environmental Science");
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", ESE1.x + 7 )
        //         .attr("y", ESE1.y + vis.boxHeightArea/2+3 + offset_wrap)
        //         .style("font-size", "10px")
        //         .text("& Engineering");
        // }
        //
        // vis.nodes_MSME = vis.Nodes.filter(obj => {
        //     return obj.name === "Materials Science & Mechanical Engineering"
        // })
        // if(vis.nodes_MSME.length > 0){
        //     let MSME1 = vis.nodes_MSME[0]
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", MSME1.x + 7 )
        //         .attr("y", MSME1.y + vis.boxHeightArea/2+3 - offset_wrap)
        //         .style("font-size", "10px")
        //         .text("Materials Science");
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", MSME1.x + 7 )
        //         .attr("y", MSME1.y + vis.boxHeightArea/2+3 + offset_wrap)
        //         .style("font-size", "10px")
        //         .text("& Mechanical Engineering");
        // }

        let links = vis.svg.selectAll(".link").data(vis.Links, d=>d.id)
        links.exit().remove();

        let linksEnter = links.enter().append("path", "g")
            .attr("class", "link")
            .attr("id", li => li.id)
            .attr("stroke", function(li){
                if(li.target.lvl === 0){ return vis.colorAreas(li.target.name); }
                else{ return vis.colorCenters(li.target.name); }
            });

        links.merge(linksEnter)
            .attr("d", function (li) {
                let oTarget;
                let oSource;

                if(li.target.lvl === 0){
                    oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeightArea,
                        y: li.target.x
                    };
                    oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight,
                        y: li.source.x
                    };

                    if (oSource.y < oTarget.y) {
                        oSource.y += vis.boxWidth;
                    } else {
                        oTarget.y += vis.boxWidthArea;
                    }
                } else{
                    oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeightCenter,
                        y: li.target.x
                    };
                    oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight,
                        y: li.source.x
                    };

                    if (oSource.y < oTarget.y) {
                        oSource.y += vis.boxWidth;
                    } else {
                        oTarget.y += vis.boxWidthCenter;
                    }
                }

                return vis.diagonal({
                    source: oSource,
                    target: oTarget
                });
            })

        // vis.svg.append("text")
        //     .attr("x", function(){
        //         let gap = (vis.width - 2*vis.boxWidthArea - 2*vis.boxWidth - vis.boxHeightCenter) / 4;
        //         return vis.boxWidthArea + vis.boxWidth + 2*gap;
        //     })
        //     .attr("y", function(){
        //         return (vis.boxHeightCenter + vis.gap.height) - 10;
        //     })
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "16px")
        //     .style("font-weight", "bold")
        //     .text("Click on any node to highlight the connections!");
    }
}
