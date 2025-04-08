import dash
from dash import html, dcc, dash_table
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import json
from datetime import datetime

# Load data
def load_data():
    try:
        with open("sample_data.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print("Error: sample_data.json file not found")
        return []
    except json.JSONDecodeError:
        print("Error: Invalid JSON in sample_data.json")
        return []

# Initialize the app
app = dash.Dash(__name__, title="Instagram Data Dashboard")

# Load the data
posts_data = load_data()

# Create a DataFrame for visualization
if posts_data:
    # Extract relevant data for DataFrame
    posts_df = pd.DataFrame([
        {
            'id': post.get('id', ''),
            'type': post.get('type', ''),
            'likes': post.get('likes', 0),
            'comments': post.get('comments', 0),
            'timestamp': post.get('timestamp', ''),
            'hashtag_count': len(post.get('hashtags', [])),
        } for post in posts_data
    ])
    
    # Convert timestamp to datetime if it exists
    if 'timestamp' in posts_df.columns and not posts_df.empty:
        posts_df['timestamp'] = pd.to_datetime(posts_df['timestamp'], errors='coerce')
        posts_df['date'] = posts_df['timestamp'].dt.date
    
    # Create figures
    engagement_fig = px.bar(posts_df, x='id', y=['likes', 'comments'], 
                          title='Likes and Comments per Post',
                          labels={'value': 'Count', 'variable': 'Metric'},
                          barmode='group')
    
    type_counts = posts_df['type'].value_counts().reset_index()
    type_counts.columns = ['type', 'count']
    types_fig = px.pie(type_counts, values='count', names='type', 
                      title='Distribution of Post Types')
    
    # Table data
    table_data = posts_df.to_dict('records')
    table_columns = [{"name": col.capitalize(), "id": col} for col in posts_df.columns 
                    if col not in ['date', 'timestamp']]
else:
    # Create empty figures if no data
    engagement_fig = go.Figure()
    engagement_fig.update_layout(
        title="No data available",
        annotations=[{
            "text": "No data found. Please make sure sample_data.json exists.",
            "showarrow": False,
            "font": {"size": 20}
        }]
    )
    types_fig = engagement_fig
    table_data = []
    table_columns = []

# App layout
app.layout = html.Div([
    html.H1("Instagram Data Dashboard", style={'textAlign': 'center', 'marginBottom': 30}),
    
    html.Div([
        html.Div([
            html.H3("Post Engagement Overview"),
            dcc.Graph(figure=engagement_fig)
        ], style={'width': '48%', 'display': 'inline-block', 'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)'}),
        
        html.Div([
            html.H3("Post Types Distribution"),
            dcc.Graph(figure=types_fig)
        ], style={'width': '48%', 'display': 'inline-block', 'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)'}),
    ], style={'display': 'flex', 'justifyContent': 'space-between', 'marginBottom': '20px'}),
    
    html.Div([
        html.H3("Posts Data Table"),
        dash_table.DataTable(
            id='posts-table',
            data=table_data,
            columns=table_columns,
            style_table={'overflowX': 'auto'},
            style_cell={
                'height': 'auto',
                'minWidth': '100px', 'width': '150px', 'maxWidth': '300px',
                'whiteSpace': 'normal',
                'textAlign': 'left'
            },
            style_header={
                'backgroundColor': 'rgb(230, 230, 230)',
                'fontWeight': 'bold'
            },
            style_data_conditional=[
                {
                    'if': {'row_index': 'odd'},
                    'backgroundColor': 'rgb(248, 248, 248)'
                }
            ],
            page_size=10,
        )
    ], style={'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)', 'marginBottom': '20px'}),
])

# Run the app
if __name__ == '__main__':
    print("Dashboard is running at http://127.0.0.1:8050")
    app.run(debug=False)  # Set debug=False for more stability
