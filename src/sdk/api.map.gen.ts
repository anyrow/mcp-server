import { sseOp, type ServiceMap } from "./api.runtime.gen.js"

export const serviceMap: ServiceMap = {
	batch: {
		download: {
			csv: {
				accept: "text/csv",
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/csv",
			},
			json: {
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/json",
			},
			xlsx: {
				accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				method: "GET",
				params: ["project_id", "batch_id"],
				path: "/v1/projects/{project_id}/batches/{batch_id}/download/xlsx",
			},
		},
		list: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/batches",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "batch_id"],
			path: "/v1/projects/{project_id}/batches/{batch_id}",
		},
	},
	column: {
		add: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id", "GET /v1/projects/:project_id/tables/:table_id/rows"],
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns",
		},
		distinct: {
			method: "GET",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}/distinct",
		},
		remove: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id", "GET /v1/projects/:project_id/tables/:table_id/rows"],
			method: "DELETE",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}",
		},
		reorder: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id"],
			method: "PUT",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/order",
		},
		update: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id", "GET /v1/projects/:project_id/tables/:table_id/rows"],
			method: "PATCH",
			params: ["project_id", "table_id", "col_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/columns/{col_id}",
		},
	},
	export: {
		retrieve: {
			method: "GET",
			params: ["project_id", "export_id"],
			path: "/v1/projects/{project_id}/exports/{export_id}",
		},
	},
	extract: {
		once: {
			invalidate: ["GET /v1/projects/:project_id/batches", "GET /v1/projects/:project_id/tables"],
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/extract",
		},
		stream: {
			call: sseOp,
			invalidate: ["GET /v1/projects/:project_id/batches", "GET /v1/projects/:project_id/tables"],
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/extract-stream",
			sse: true,
		},
		table: {
			once: {
				invalidate: ["GET /v1/projects/:project_id/batches", "GET /v1/projects/:project_id/tables/:table_id/rows"],
				method: "POST",
				params: ["project_id", "table_id"],
				path: "/v1/projects/{project_id}/tables/{table_id}/extract",
			},
			stream: {
				call: sseOp,
				invalidate: ["GET /v1/projects/:project_id/batches", "GET /v1/projects/:project_id/tables/:table_id/rows"],
				method: "POST",
				params: ["project_id", "table_id"],
				path: "/v1/projects/{project_id}/tables/{table_id}/extract-stream",
				sse: true,
			},
		},
	},
	project: {
		retrieve: {
			method: "GET",
			params: ["organization_id", "project_id"],
			path: "/v1/organizations/{organization_id}/projects/{project_id}",
		},
	},
	row: {
		aggregate: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/aggregate",
		},
		bulk: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id/rows", "GET /v1/projects/:project_id/tables/:table_id/rows/aggregate"],
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/bulk",
		},
		create: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id/rows", "GET /v1/projects/:project_id/tables/:table_id/rows/aggregate"],
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows",
		},
		delete: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id/rows", "GET /v1/projects/:project_id/tables/:table_id/rows/:row_id", "GET /v1/projects/:project_id/tables/:table_id/rows/aggregate"],
			method: "DELETE",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
		list: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
		source: {
			accept: "application/octet-stream",
			method: "GET",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}/source",
		},
		update: {
			invalidate: ["GET /v1/projects/:project_id/tables/:table_id/rows", "GET /v1/projects/:project_id/tables/:table_id/rows/:row_id", "GET /v1/projects/:project_id/tables/:table_id/rows/aggregate"],
			method: "PATCH",
			params: ["project_id", "table_id", "row_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/rows/{row_id}",
		},
	},
	suggest: {
		schema: {
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/suggest-schema",
		},
	},
	table: {
		create: {
			invalidate: ["GET /v1/projects/:project_id/tables"],
			method: "POST",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/tables",
		},
		delete: {
			invalidate: ["GET /v1/projects/:project_id/tables", "GET /v1/projects/:project_id/tables/:table_id"],
			method: "DELETE",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
		duplicate: {
			invalidate: ["GET /v1/projects/:project_id/tables"],
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/duplicate",
		},
		export: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/export",
		},
		list: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/tables",
		},
		restore: {
			invalidate: ["GET /v1/projects/:project_id/tables", "GET /v1/projects/:project_id/tables/:table_id"],
			method: "POST",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}/restore",
		},
		retrieve: {
			method: "GET",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
		update: {
			invalidate: ["GET /v1/projects/:project_id/tables", "GET /v1/projects/:project_id/tables/:table_id"],
			method: "PATCH",
			params: ["project_id", "table_id"],
			path: "/v1/projects/{project_id}/tables/{table_id}",
		},
	},
	tableTemplate: {
		create: {
			invalidate: ["GET /v1/table-templates"],
			method: "POST",
			path: "/v1/table-templates",
		},
		delete: {
			invalidate: ["GET /v1/table-templates", "GET /v1/table-templates/:template_id"],
			method: "DELETE",
			params: ["template_id"],
			path: "/v1/table-templates/{template_id}",
		},
		listMine: {
			method: "GET",
			path: "/v1/table-templates/mine",
		},
		projectList: {
			method: "GET",
			params: ["project_id"],
			path: "/v1/projects/{project_id}/table-templates",
		},
		projectRetrieve: {
			method: "GET",
			params: ["project_id", "template_id"],
			path: "/v1/projects/{project_id}/table-templates/{template_id}",
		},
		update: {
			invalidate: ["GET /v1/table-templates", "GET /v1/table-templates/:template_id"],
			method: "PATCH",
			params: ["template_id"],
			path: "/v1/table-templates/{template_id}",
		},
		use: {
			invalidate: ["GET /v1/projects/:project_id/tables"],
			method: "POST",
			params: ["project_id", "template_id"],
			path: "/v1/projects/{project_id}/table-templates/{template_id}/use",
		},
	},
}
