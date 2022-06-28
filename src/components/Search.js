import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactHtmlParser from "html-react-parser";
import DOMPurify from "dompurify";
import {
  Select,
  MenuItem,
  InputLabel,
  Input,
  FormControl,
  Button,
} from "@mui/material";

const Search = () => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState({});
  const [allCompanies, setAllCompanies] = useState([]);
  let e = React.createElement("p", {}, "Hello, World!");
  const getArrayFromHtml = (data) => {
    let parser = new DOMParser();
    let parsedHtml = parser.parseFromString(data, "text/html");
    let pTags = parsedHtml.getElementsByTagName("div");
    let d = [];
    console.log("pp", pTags);
    // setResults(pTags)
    for (let p of pTags) {
      let cleanHtmlString = DOMPurify.sanitize(p, {
        USE_PROFILES: { html: true },
      });
      d.push(cleanHtmlString);
    }
    setResults(d);
  };

  useEffect(() => {
    const searchArticles = async () => {
      const { data } = await axios.get(
        `http://localhost:5001/custom-search?search=${term}`
      );
      console.log("dd", data);
      getArrayFromHtml(data);
      // setResults(data)
    };

    const timeoutId = setTimeout(() => {
      if (term) searchArticles();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [term]);

  const onSelect = (item) => {
    setTerm(ReactHtmlParser(item).props.id.split("/")[1]);
    setSelectedCompany(item);
    setResults([]);
  };

  useEffect(() => {
    getAllCompanies()
  }, []);

  const getAllCompanies = async () => {
    let companies = await axios.get("http://localhost:5001/companies");
    setAllCompanies(companies.data);
  };

  const onSubmit = async (item) => {
    const company_name = ReactHtmlParser(item).props.id.split("/")[1];
    const cin = ReactHtmlParser(item).props.id.split("/")[2];
    let res = await axios.post("http://localhost:5001/add_company", {
      company_name,
      cin,
    });
    if (res.data.status) {
      alert(res.data.message);
      setSelectedCompany("")
      setTerm("")
    }
    getAllCompanies()
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Company Name"
      />
      {results.map((item, i) => (
        <MenuItem key={i} onClick={() => onSelect(item)}>
          {ReactHtmlParser(item)}
        </MenuItem>
      ))}
      <br/>
      <Button onClick={() => onSubmit(selectedCompany)} variant="outlined">Submit</Button>
      <div>
        <h2>Added Companies</h2>
        {allCompanies.map((company, i) => (
          <div key={i} >
            {company.company_name}: {company.cin}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
