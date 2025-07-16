import { useState, useEffect } from "react";
import { ErrorHandler } from "@hrbolek/uoisfrontend-shared";
import { useAsyncAction, createAsyncGraphQLAction } from "@hrbolek/uoisfrontend-gql-shared";

import GroupForm from "../Components/GroupForm";
import GroupSuccessAlert from "../Components/GroupSuccessAlert";
import { groupTypes } from "../Components/constants";
import { groupTypePageQuery, groupInsertQuery } from "../Queries/Queries";

/**
 * DataGeneratorPage component - Main page for creating new groups
 * Manages group creation workflow including loading group types and handling form submission
 * @returns {JSX.Element} DataGeneratorPage component
 */
export const DataGeneratorPage = () => {
  const [createdGroup, setCreatedGroup] = useState(null);
  const [loadedGroupTypes, setLoadedGroupTypes] = useState(groupTypes);
  const [usingFallback, setUsingFallback] = useState(true);

  /**
   * Async action for loading group types from GraphQL
   */
  const {
    fetch: loadGroupTypes,
    loading: loadingGroupTypes,
    error: groupTypesError,
  } = useAsyncAction(
    createAsyncGraphQLAction(groupTypePageQuery),
    {
      onSuccess: (data) => {
        const types = data?.data?.groupTypePage;
        if (types && Array.isArray(types)) {
          setLoadedGroupTypes(types);
          setUsingFallback(false);
        }
      },
    },
    { deferred: true }
  );

  /**
   * Async action for inserting new group via GraphQL
   */
  const {
    fetch: insertGroup,
    loading: inserting,
    error: insertError,
  } = useAsyncAction(
    createAsyncGraphQLAction(groupInsertQuery),
    {
      onSuccess: (data) => {
        console.log("onSuccess spuštěn!");
        console.log("Celá odpověď:", data);
        const result = data?.data?.groupInsert;
        console.log("Výsledek groupInsert:", result);
        if (result && result.id) {
          console.log("Nastavujem createdGroup:", result);
          setCreatedGroup(result);
        } else {
          console.log("Podmínka result && result.id selhala");
          alert("Vytvoření skupiny selhalo.");
          console.warn("Neočekávaná odpověď:", data);
        }
      },
      onError: (error) => {
        console.log("onError spuštěn:", error);
      },
      onSettled: (data, error) => {
        console.log("onSettled spuštěn - data:", data, "error:", error);
      }
    },
    { deferred: true }
  );

  /**
   * Effect to load group types on component mount
   */
  useEffect(() => {
    loadGroupTypes();
  }, []);

  /**
   * Handles form submission for creating new group
   * @param {Object} groupData - Group data from form
   * @param {string} groupData.name - Group name
   * @param {string} groupData.groupTypeId - Group type ID
   */
  const handleSubmit = async ({ name, groupTypeId }) => {
    console.log("handleSubmit spuštěn");
    console.log("Odesílám data:", { name, grouptypeId: groupTypeId });
    
    // Clear previous result
    setCreatedGroup(null);
    
    try {
      // Call with GraphQL variables object
      const result = await insertGroup({ 
        name: name, 
        grouptypeId: groupTypeId 
      });
      
      console.log("Výsledek await insertGroup:", result);
      
      const groupResult = result?.data?.groupInsert;
      console.log("groupInsert data:", groupResult);
      
      if (groupResult && groupResult.id) {
        console.log("Nastavujem createdGroup:", groupResult);
        setCreatedGroup(groupResult);
      } else {
        alert("Vytvoření skupiny selhalo.");
        console.warn("Neočekávaná odpověď:", result);
      }
    } catch (error) {
      console.error("Chyba při vytváření skupiny:", error);
      alert("Došlo k chybě při vytváření skupiny.");
    }
  };

  /**
   * Handles creating new group by clearing the current created group
   */
  const handleCreateNew = () => {
    setCreatedGroup(null);
  };

  return (
    <div className="container mt-4">
      <h3>Vytvoření nové skupiny</h3>
      
      <div className="mb-3">
        <small>Debug: createdGroup = {createdGroup ? "má hodnotu" : "null"}</small>
        {createdGroup && <small><br/>ID: {createdGroup.id}</small>}
      </div>

      {insertError && <ErrorHandler errors={insertError} />}
      {groupTypesError && <ErrorHandler errors={groupTypesError} />}

      <GroupSuccessAlert 
        createdGroup={createdGroup} 
        onCreateNew={handleCreateNew} 
      />

      <GroupForm
        groupTypes={loadedGroupTypes}
        onSubmit={handleSubmit}
        loading={inserting}
        loadingGroupTypes={loadingGroupTypes}
        usingFallback={usingFallback}
      />
    </div>
  );
};