import React from "react";
import { useState, useEffect } from "react";
import Form from "./Form";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

function JobsPage(props) {
  const loggedInUser = props.loggedInUser;
  const setLoggedInUser = props.setLoggedInUser;
  const urlDomain = props.urlDomain;
  const [jobs, setJobs] = useState([]);

  const fileInput = React.useRef();

  // useEffect(() => {
  //   fetch(`${urlDomain}/users/me/`, {
  //   // fetch("http://localhost:5000/users/me", {
  //     method: "GET",
  //     credentials: "include",
  //   })
  //     .then((data) => data.json())
  //     .then((user) => {
  //       console.log("GETTING USER OBJ JOBSPAGE")
  //       console.log(user)
  //       if (user) {
  //         setLoggedInUser(user.user);
  //       }
  //     });
  // }, []);

  useEffect(() => {
    fetch(`${urlDomain}/jobs/get`, {
      body: JSON.stringify({ user: loggedInUser }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      setJobs(data);
    });
  }, [loggedInUser]);

  const commentInput = React.useRef();
  const checkBoxInput = React.useRef();
  const owedInput = React.useRef();

  const handleComplete = (event, form) => {
    event.preventDefault();
    const stageCost = parseInt(form["Stage Cost"], 10);

    if (
      form["Work Complete"] !== true ||
      typeof stageCost !== "number" ||
      stageCost <= 0
    ) {
      alert("Must ensure work is complete and stage cost is more than $0");
      return;
    }

    const payload = {
      "user": loggedInUser,
      "status": "PaymentPending",
      "owed": stageCost,
    };

    fetch(`${urlDomain}/jobs/${form.jobId}/${form.stageId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      setJobs(data);
    })

  };

  const handleClick = (event, form) => {
    event.preventDefault();
    const payload = {
      "user": loggedInUser,
      "comments": [
        {
          "name": loggedInUser.name,
          "comment": form.Comment,
        },
      ],
    };
    fetch(`${urlDomain}/jobs/${form.jobId}/${form.stageId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      setJobs(data);
    })
  };

  const handleApprove = (event, jobId) => {
    event.preventDefault();
    // console.log("approved");
    // console.log(jobId);
    const payload = {
      "user": loggedInUser,
      "status": "Complete",
    };
    // console.log(payload);
    fetch(`${urlDomain}/jobs/${jobId}/0`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      setJobs(data);
    })
  };

  const handlePayment = (event, jobId, stageId) => {
    event.preventDefault();
    // console.log("payment");
    // console.log(jobId);
    const payload = {
      "user": loggedInUser,
      "owed": 0,
    };
    // console.log(payload);
    fetch(`${urlDomain}/jobs/${jobId}/${stageId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      setJobs(data);
    })
  };

  const handleUpload = (event, form) => {
    event.preventDefault();
    let uploadform = new FormData()
    for (let i = 0; i < fileInput.current.files.length; i++) {
        uploadform.append(
          fileInput.current.files[i].name, 
          fileInput.current.files[i]
        )
    }

    if(fileInput.current.files.length > 0){

      fetch(`${urlDomain}/jobs/upload`, {
        method: "POST",
        body: uploadform,
        credentials: 'include'
      })
      .then(data => data.json())
      .then(data => {
        //comes back as an array
        const payload = {
          "user": loggedInUser,
          "pictures": data.locations
        }
        
        // console.log(payload);
        
        return fetch(`${urlDomain}/jobs/${form.jobId}/${form.stageId}`, {
          body: JSON.stringify(payload),
          method: "PATCH",
          headers: {
            'Content-Type': "application/json"
          },
          credentials: 'include'
        })
      })
      .then(data => data.json())
      .then(jobs => {
        setJobs(jobs)
      })
      .catch((error) => (error))
    }
  };

  let eventKey = ""
  // let jobEventKey = ""
  let totalPaid = 0
  let completedBool = false

  return (
    <div className="page-body homePageContainer" style={{maxWidth: "100vw"}}>
      {/* <h1 style={{padding: "10px"}}>Your Jobs</h1> */}
      {jobs.length === 0 ? (
        <div id="emptyJobsMsg">
          <h1>Go to the contact page to start a job today!</h1>
        </div>
      ) : (
        <h1 style={{padding: "10px"}}>Your Jobs</h1>
      )}
      {typeof jobs !== undefined ? (
        jobs.sort((a, b) => (a.jobComplete > b.jobComplete) ? 1 : -1).map((job, index) => (
          <>
          {completedBool === false && job.jobComplete === true ? (
            <>
              <h2 style={{padding: "10px"}}>Completed Jobs</h2>
              <div hidden>{completedBool = true}</div>
            </>
          )
            : 
            <></>}
          <Accordion defaultActiveKey="0" key={job._id}>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="1">
                  {job.buildAddress}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <>
                    {/* <p>Job is Complete?: {`${job.jobComplete}`}</p> */}
                    <p>Job Description: {job.description}</p>
                    <p>Job Client: {job.clientName}</p>
                    <p>Job Address: {job.buildAddress}</p>
                    <p>
                      Total Build Cost To Date:
                      {job.stages.map((stage, index) => {
                        index === 0 ? totalPaid = 0 : totalPaid += stage.paid
                        return (index === job.stages.length - 1 ? ` $${totalPaid}` : <React.Fragment key={index}></React.Fragment>)
                      })}
                      {/* {` $${totalPaid}`} */}
                    </p>
                    <p>Design Docs:</p>
                    <ul>
                      {job.designDocs.map((doc, index) => (
                        <li key={index}>
                          <img style={{height: "150px"}} src={doc.link} alt="design document"></img>
                        </li>
                      ))}
                    </ul>
                    {job.stages[0].status === "AwaitingApproval" ? (
                      <></>
                    ) : (
                      <p>Build Stages:</p>
                    )}
                    <ul>
                      {job.stages
                        .slice(0)
                        .reverse()
                        .map((stage, index) =>
                          stage.status === "Hidden" ||
                          stage.status === "AwaitingApproval" ? (
                            <React.Fragment key={index}></React.Fragment>
                          ) : (
                            <Accordion defaultActiveKey="0" key={index}>
                              <div hidden>
                                {stage.status !== "Complete" && job.jobComplete !== true
                                  ? (eventKey = "0")
                                  : (eventKey = "1")}
                              </div>
                              <Card>
                                <Card.Header>
                                  <Accordion.Toggle
                                    as={Button}
                                    variant="link"
                                    eventKey={eventKey}
                                  >
                                    {stage.name} {stage.status}
                                  </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey={eventKey}>
                                  <Card.Body>
                                    {
                                      <li>
                                        <p>Stage: {stage.name}</p>
                                        <p>Status: {stage.status}</p>
                                        <p>Funds Owed: {stage.owed}</p>
                                        {loggedInUser.role === "Builder" &&
                                        stage.status === "InProgress" && job.jobComplete !== true ? (
                                          <Form
                                            jobId={job._id}
                                            stageId={stage.index}
                                            handleSubmit={handleComplete}
                                            formFields={[
                                              "Work Complete",
                                              "Stage Cost",
                                            ]}
                                            formTypes={["checkbox", "number"]}
                                            multiple={[false, false]}
                                            // required={[true, true]}
                                            refers={[checkBoxInput, owedInput]}
                                            defaultValue={[false, 0]}
                                            title="Set Stage Cost"
                                          />
                                        ) : (
                                          <></>
                                        )}
                                        {loggedInUser.role === "Client" &&
                                        stage.status === "PaymentPending" && job.jobComplete !== true ? (
                                          <Button
                                            className="nav-link"
                                            onClick={(e) =>
                                              handlePayment(
                                                e,
                                                job._id,
                                                stage.index
                                              )
                                            }
                                          >
                                            Pay Stage Cost
                                          </Button>
                                        ) : (
                                          <></>
                                        )}
                                        <p>Funds Paid: {stage.paid}</p>
                                        <div>
                                          Stage Images:{" "}
                                          {stage.pictures.map((picture, index) => (
                                            <div key={index}>
                                              <img src={picture.link} alt="stage" ></img>
                                            </div>
                                          ))}
                                        </div>
                                        {loggedInUser.role === "Builder" &&
                                        stage.status === "InProgress" && job.jobComplete !== true ? (
                                          <Form
                                            jobId={job._id}
                                            stageId={stage.index}
                                            handleSubmit={handleUpload}
                                            formFields={["Images"]}
                                            formTypes={["file"]}
                                            multiple={[true]}
                                            // required={[true, true]}
                                            refers={[fileInput]}
                                            defaultValue={[null]}
                                            title="upload"
                                          />
                                        ) : (
                                          <></>
                                        )}
                                        <div>
                                          Stage Comments:{" "}
                                          {stage.comments.map((comment, index) => (
                                            // <li>
                                            //   <p>{comment.name}</p>
                                            //   <p>{comment.comment}</p>
                                            // </li>

                                            <Card key={index}>
                                              <Card.Header>
                                                <Card.Title>
                                                  {comment.name}
                                                </Card.Title>
                                              </Card.Header>
                                              <Card.Body>
                                                <Card.Text>
                                                  {comment.comment}
                                                </Card.Text>
                                              </Card.Body>
                                            </Card>
                                          ))}
                                          {stage.status !== "Complete" && job.jobComplete !== true ? (
                                            <Form
                                              jobId={job._id}
                                              stageId={stage.index}
                                              handleSubmit={handleClick}
                                              formFields={["Comment"]}
                                              formTypes={["textarea"]}
                                              multiple={[false]}
                                              refers={[commentInput]}
                                              defaultValue={[null]}
                                              title="Comment!"
                                            />
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </li>
                                    }
                                  </Card.Body>
                                </Accordion.Collapse>
                              </Card>
                            </Accordion>
                          )
                        )}
                    </ul>
                    {loggedInUser.role === "Builder" &&
                    job.stages[0].status === "AwaitingApproval" && job.jobComplete !== true ? (
                      <>
                        <Button
                          className="nav-link"
                          onClick={(e) => handleApprove(e, job._id)}
                        >
                          Approve Job
                        </Button>
                      </>
                    ) : (
                      <></>
                    )}
                    {loggedInUser.role === "Client" && job.jobComplete !== true ? (
                      <Button className="nav-link">
                        <Link
                          to={`/jobs/${job._id}`}
                          style={{ color: "white" }}
                        >
                          Edit Job
                        </Link>
                      </Button>
                    ) : (
                      <></>
                    )}
                  </>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
          </>
        ))
      ) : (
        <p>{"Loading List"}</p>
      )}
    </div>
  );
}

export default JobsPage;